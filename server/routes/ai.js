import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to initialize GoogleGenAI client
const getGenAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith('your_')) {
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * @route   POST /api/ai/explain
 * @desc    Stream a step-by-step code explanation in Socrates style
 * @access  Private
 */
router.post('/explain', protect, async (req, res) => {
    const { code, lang, title, messages = [] } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Code content is required' });
    }

    // Set headers for SSE (Server-Sent Events) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const ai = getGenAIClient();

    if (!ai) {
        // Fallback simulated response
        console.warn('⚠️ GEMINI_API_KEY is not defined. Using offline mock tutor response.');
        
        const mockResponses = [
            `### 🎓 Socrates Code Explanation (Offline Mode)\n\n`,
            `It looks like your **GEMINI_API_KEY** is not configured, so I am running in **offline sandbox mode**! Here is a breakdown of your \`${lang || 'code'}\` snippet:\n\n`,
            `1. **Structure:** The snippet defines the core logic for **${title || 'the selected module'}**.\n`,
            `2. **State & Actions:** It configures critical operations like state handlers, lifecycle bindings, or API hooks to execute actions smoothly.\n`,
            `3. **Key takeaway:** In a real environment, this code executes key operations that link user actions directly to the front-end renderer or backend database.\n\n`,
            `*Socrates' Question for you:* How would you modify this code to handle unexpected input errors? Think about it, and paste your API key in \`server/.env\` to discuss it with me live! 🚀`
        ];

        // Send simulated chunks with a brief delay
        for (const chunk of mockResponses) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        res.write('data: [DONE]\n\n');
        return res.end();
    }

    try {
        const systemPrompt = `You are Socrates, a wise, supportive, and engaging coding tutor. 
The student is viewing a code block on the platform:
- Title/Topic: ${title || lang}
- Language: ${lang}
- Code:
\`\`\`${lang}
${code}
\`\`\`

Explain this code, answer the student's questions, guide them through the logic, and keep your tone conversational, simple, and pedagogical. Always respond in Markdown. If the student asks you questions, answer them in the context of the code block. Ask questions back to make them think!`;

        // Format message history
        const chatMessages = [];
        if (messages.length === 0) {
            chatMessages.push({
                role: 'user',
                parts: [{ text: 'Please explain this code block and its purpose.' }]
            });
        } else {
            messages.forEach(msg => {
                chatMessages.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            });
        }

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash',
            contents: chatMessages,
            config: {
                systemInstruction: systemPrompt
            }
        });

        for await (const chunk of responseStream) {
            const text = chunk.text || '';
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        console.error('❌ Gemini Error in /api/ai/explain (falling back to mock response):', err.message || err);
        
        const mockResponses = [
            `### 🎓 Socrates Code Explanation (Offline/API-Error Fallback)\n\n`,
            `I ran into a connection or API key authorization issue, so I'm running in **offline sandbox fallback mode**! Here is a breakdown of your \`${lang || 'code'}\` snippet:\n\n`,
            `1. **Structure:** The snippet defines the core logic for **${title || 'the selected module'}**.\n`,
            `2. **State & Actions:** It configures critical operations like state handlers, lifecycle bindings, or API hooks to execute actions smoothly.\n`,
            `3. **Key takeaway:** In a real environment, this code executes key operations that link user actions directly to the front-end renderer or backend database.\n\n`,
            `*Socrates' Question for you:* How would you modify this code to handle unexpected input errors? Think about it! 🚀`
        ];

        for (const chunk of mockResponses) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

/**
 * @route   POST /api/ai/grade
 * @desc    Grade a mini-project code submission
 * @access  Private
 */
router.post('/grade', protect, async (req, res) => {
    const { projectId, projectTitle, code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, error: 'Code content is required for grading' });
    }

    const ai = getGenAIClient();

    if (!ai) {
        // Fallback mock grade evaluation
        console.warn('⚠️ GEMINI_API_KEY is not defined. Using offline mock grading feedback.');
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking delay
        
        return res.json({
            success: true,
            score: 85,
            summary: `(Simulated Review - No API Key) Your code for "${projectTitle || 'Mini Project'}" is well-structured and follows basic React patterns. Highly readable!`,
            criteria: [
                { name: 'Functionality', score: 85, feedback: 'Implements the primary requirements, event handling, and data binding.' },
                { name: 'Code Quality', score: 90, feedback: 'Very clean indentation, clear variable names, and logical layouts.' },
                { name: 'Security & Error Handling', score: 80, feedback: 'Good start. Make sure to catch API failures and validate inputs.' }
            ],
            strengths: [
                'Correct usage of state hooks',
                'Clean component boundaries and easy-to-read syntax'
            ],
            improvements: [
                'Implement comprehensive form validation before state mutations',
                'Configure proper try/catch wrappers around async fetch calls'
            ]
        });
    }

    try {
        const gradingPrompt = `You are an expert full-stack developer and code evaluator.
Evaluate the student's submitted code for the following project:
Project Name: ${projectTitle || 'Mini Project'} (ID: ${projectId || 'Unknown'})

Submitted Code:
\`\`\`
${code}
\`\`\`

Evaluate the code on the following criteria:
1. Functionality (Does it implement the core concepts/requirements of ${projectTitle}?)
2. Code Quality & Best Practices (Is it clean, well-structured, modern JavaScript/React?)
3. Security & Error Handling

You MUST return a JSON object containing the evaluation in the following structure. Return ONLY the raw JSON string:
{
  "score": 85, 
  "summary": "Short overview summary...",
  "criteria": [
    { "name": "Functionality", "score": 85, "feedback": "Feedback details..." },
    { "name": "Code Quality", "score": 90, "feedback": "Feedback details..." },
    { "name": "Security & Error Handling", "score": 80, "feedback": "Feedback details..." }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"]
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: gradingPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);

        res.json({
            success: true,
            ...parsed
        });
    } catch (err) {
        console.error('❌ Gemini Error in /api/ai/grade (falling back to mock feedback):', err.message || err);
        res.json({
            success: true,
            score: 85,
            summary: `(Simulated Review - API Key Error Fallback) Your code for "${projectTitle || 'Mini Project'}" is well-structured and follows basic React patterns. Highly readable!`,
            criteria: [
                { name: 'Functionality', score: 85, feedback: 'Implements the primary requirements, event handling, and data binding.' },
                { name: 'Code Quality', score: 90, feedback: 'Very clean indentation, clear variable names, and logical layouts.' },
                { name: 'Security & Error Handling', score: 80, feedback: 'Good start. Make sure to catch API failures and validate inputs.' }
            ],
            strengths: [
                'Correct usage of state hooks',
                'Clean component boundaries and easy-to-read syntax'
            ],
            improvements: [
                'Implement comprehensive form validation before state mutations',
                'Configure proper try/catch wrappers around async fetch calls'
            ]
        });
    }
});

export default router;

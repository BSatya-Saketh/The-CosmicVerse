import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useAi } from '../context/AiContext.jsx';

// ── Token colors (inline styles — zero external CSS dependency) ──────────────
const COLORS = {
    kw:   '#c792ea',   // const, let, function, return …
    fn:   '#82aaff',   // function( calls )
    str:  '#c3e88d',   // "strings" / `templates`
    num:  '#f78c6c',   // 42, 3.14
    cm:   '#546e7a',   // // comments  /* block */
    bool: '#ff5572',   // true | false | null | undefined
    cls:  '#ffcb6b',   // ClassName / Constructor
    prop: '#80cbc4',   // object.property
    tag:  '#f07178',   // <html-tags>
    attr: '#c792ea',   // html-attributes
    val:  '#c3e88d',   // attribute="values"
    sel:  '#f07178',   // CSS .selectors
    cv:   '#82aaff',   // css-property-name
    cs:   '#c3e88d',   // css: property-value
};

// Control characters as placeholders — never appear in real source code
const O   = (cls) => `\x02${cls}\x02`;   // open  token
const C   = '\x03';                        // close token
const PH  = (i)   => `\x04p${i}p\x04`;   // extracted segment placeholder

// Convert tokens → <span style="color:...">…</span>
const toSpans = (s) =>
    s
        .replace(/\x02([a-z]+)\x02/g, (_, cls) => {
            const color = COLORS[cls] || 'inherit';
            return cls === 'cm'
                ? `<span style="color:${color};font-style:italic">`
                : `<span style="color:${color}">`;
        })
        .replace(/\x03/g, '</span>');

// ── HTML / Bootstrap highlighter ─────────────────────────────────────────────
function highlightHTML(s) {
    return s
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g,
            `${O('cm')}$1${C}`)
        .replace(/(&lt;\/?)([\w:-]+)/g,
            `$1${O('tag')}$2${C}`)
        .replace(/ ([\w:-]+)(=)/g,
            ` ${O('attr')}$1${C}$2`)
        .replace(/=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
            `=${O('val')}$1${C}`);
}

// ── CSS / SCSS highlighter ────────────────────────────────────────────────────
function highlightCSS(s) {
    const saved = [];

    // 1. Protect /* comments */
    s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => {
        saved.push(m);
        return PH(saved.length - 1);
    });

    // 2. Selectors (text before {)
    s = s.replace(/([^{};/\n][^{};/]*?)(\s*\{)/g,
        (_, sel, brace) => `${O('sel')}${sel}${C}${brace}`
    );

    // 3. property: value; pairs inside { } blocks
    s = s.replace(/\{([^}]*)\}/g, (_, block) => {
        const hi = block.replace(
            /([\w-]+)(\s*:)([^;{}]*)(;)/g,
            `${O('cv')}$1${C}$2${O('cs')}$3${C}$4`
        );
        return `{${hi}}`;
    });

    // 4. Restore comments
    saved.forEach((v, i) => {
        s = s.replace(PH(i), () => `${O('cm')}${v}${C}`);
    });

    return s;
}

// ── JavaScript / TypeScript / Node / SQL highlighter ─────────────────────────
function highlightJS(s) {
    const saved = [];

    // FIX: Single-pass protection for comments and strings so they don't corrupt each other
    const protectRegex = /(\/\*[\s\S]*?\*\/|\/\/.*|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;

    s = s.replace(protectRegex, (m) => {
        const type = m.startsWith('/') ? 'cm' : 'str';
        saved.push({ t: type, v: m });
        return PH(saved.length - 1);
    });

    // Step 2 — highlight remaining bare code
    s = s
        .replace(
            /\b(const|let|var|function|return|import|export|from|default|class|extends|new|async|await|try|catch|finally|throw|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|void|delete|yield|static|super|this|module|require)\b/g,
            `${O('kw')}$1${C}`
        )
        .replace(
            /\b(true|false|null|undefined|NaN|Infinity)\b/g,
            `${O('bool')}$1${C}`
        )
        .replace(/\b(\d+\.?\d*)\b/g, `${O('num')}$1${C}`)
        .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, `${O('cls')}$1${C}`)
        .replace(/\b([a-z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, `${O('fn')}$1${C}`)
        .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)(?!\s*\()/g, `.${O('prop')}$1${C}`)
        .replace(
            /\b(SELECT|INSERT|INTO|VALUES|WHERE|ORDER|BY|DESC|ASC|LIMIT|UPDATE|SET|DELETE|FROM|INNER|LEFT|JOIN|ON|WITH|AS|CREATE|TABLE|VARCHAR|INT|PRIMARY|KEY|FOREIGN|TIMESTAMP|ENUM|NOT NULL|AUTO_INCREMENT)\b/g,
            `${O('kw')}$1${C}`
        );

    // Step 3 — restore protected strings & comments
    saved.forEach(({ t, v }, i) => {
        s = s.replace(PH(i), () => `${O(t)}${v}${C}`);
    });

    return s;
}

// ── JSX highlighter — handles mixed JS + HTML tags ───────────────────────────
function highlightJSX(s) {
    const saved = [];

    // FIX: Single-pass protection for JSX (Comments, Strings AND HTML tags)
    const protectRegex = /(\/\*[\s\S]*?\*\/|\/\/.*|`(?:[^`\\]|\\.)*`|&lt;\/?[\w][\s\S]*?\/?\s*&gt;|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;

    s = s.replace(protectRegex, (m) => {
        let type;
        let val = m;

        if (m.startsWith('&lt;')) {
            type = 'raw';
            val = highlightHTML(m); // Parse the HTML tag immediately
        } else if (m.startsWith('/')) {
            type = 'cm';
        } else {
            type = 'str';
        }

        saved.push({ t: type, v: val });
        return PH(saved.length - 1);
    });

    // Apply JS keyword highlighting to remaining code
    s = s
        .replace(
            /\b(const|let|var|function|return|import|export|from|default|class|extends|new|async|await|try|catch|finally|throw|if|else|switch|case|break|continue|for|while|do|of|in|typeof|instanceof|void|delete|yield|static|super|this|module|require)\b/g,
            `${O('kw')}$1${C}`
        )
        .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, `${O('bool')}$1${C}`)
        .replace(/\b(\d+\.?\d*)\b/g, `${O('num')}$1${C}`)
        .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, `${O('cls')}$1${C}`)
        .replace(/\b([a-z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, `${O('fn')}$1${C}`)
        .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)(?!\s*\()/g, `.${O('prop')}$1${C}`);

    // Restore all saved segments
    saved.forEach(({ t, v }, i) => {
        if (t === 'raw') {
            s = s.replace(PH(i), () => v);          // already highlighted HTML
        } else {
            s = s.replace(PH(i), () => `${O(t)}${v}${C}`);
        }
    });

    return s;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CodeBlock({ code, lang = 'javascript', title }) {
    const [copied, setCopied] = useState(false);
    const location = useLocation();
    const { isBookmarked, toggleBookmark } = useProgress();
    const { openSocrates } = useAi();

    const bookmarked = isBookmarked(code);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const highlightCode = (rawCode) => {
        if (!rawCode) return '';

        // Escape HTML entities before processing
        let s = rawCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const l = lang.toLowerCase();

        if (l === 'html' || l === 'bootstrap') {
            s = highlightHTML(s);
        } else if (l === 'css' || l === 'scss' || l === 'less') {
            s = highlightCSS(s);
        } else if (l === 'jsx' || l === 'tsx' || l === 'jsx-html') {
            s = highlightJSX(s);
        } else {
            // javascript, js, ts, node, sql, json, bash, shell, text, etc.
            s = highlightJS(s);
        }

        return toSpans(s);
    };

    return (
        <div className="code-block">
            <div className="code-header">
                <span className="code-label">{title || lang}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="code-dots" style={{ marginRight: '8px' }}>
                        <div className="code-dot" style={{ background: '#ff5f56' }} />
                        <div className="code-dot" style={{ background: '#ffbd2e' }} />
                        <div className="code-dot" style={{ background: '#27c93f' }} />
                    </div>
                    <button
                        className="code-socrates"
                        onClick={() => openSocrates(code, lang, title || lang)}
                        style={{
                            background: 'rgba(181, 122, 255, 0.08)',
                            border: '1px solid rgba(181, 122, 255, 0.3)',
                            color: 'var(--purple)',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(181, 122, 255, 0.18)';
                            e.currentTarget.style.borderColor = 'var(--purple)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(181, 122, 255, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(181, 122, 255, 0.3)';
                        }}
                    >
                        🎓 ask socrates
                    </button>
                    <button
                        className={`code-bookmark${bookmarked ? ' active' : ''}`}
                        onClick={() => toggleBookmark({
                            page: location.pathname,
                            title: title || lang,
                            lang,
                            code
                        })}
                        style={{
                            background: 'none',
                            border: '1px solid var(--border2)',
                            color: bookmarked ? 'var(--yellow)' : 'var(--text3)',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            borderColor: bookmarked ? 'var(--yellow)' : 'var(--border2)'
                        }}
                    >
                        {bookmarked ? '★ starred' : '☆ star'}
                    </button>
                    <button
                        className={`code-copy${copied ? ' copied' : ''}`}
                        onClick={handleCopy}
                    >
                        {copied ? '✓ copied' : 'copy'}
                    </button>
                </div>
            </div>
            <pre style={{ margin: 0, padding: '20px', overflowX: 'auto', background: '#0d0d0d' }}>
                <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
            </pre>
        </div>
    );
}

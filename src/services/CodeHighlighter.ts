import hljs from 'highlight.js'

/**
 * 코드 구문 강조를 담당하는 서비스 클래스
 * 싱글톤 패턴을 사용하여 전역에서 하나의 인스턴스만 사용
 */
export class CodeHighlighter {
    private static instance: CodeHighlighter | null = null
    private readonly supportedLanguages: Set<string>

    /**
     * 생성자 - private으로 외부에서 직접 인스턴스 생성 방지
     */
    private constructor() {
        // highlight.js 초기화
        this.initializeHighlighter()

        // 지원하는 언어 목록 설정
        this.supportedLanguages = new Set([
            'javascript',
            'typescript',
            'python',
            'java',
            'csharp',
            'cpp',
            'c',
            'html',
            'css',
            'scss',
            'sass',
            'json',
            'xml',
            'yaml',
            'markdown',
            'sql',
            'shell',
            'bash',
            'powershell',
            'go',
            'rust',
            'php',
            'ruby',
            'swift',
            'kotlin',
            'dart',
            'vue',
            'jsx',
            'tsx',
            'dockerfile',
            'nginx',
            'apache',
            'plaintext',
            'text'
        ])
    }

    /**
     * 싱글톤 인스턴스 반환
     */
    public static getInstance(): CodeHighlighter {
        if (!CodeHighlighter.instance) {
            CodeHighlighter.instance = new CodeHighlighter()
        }
        return CodeHighlighter.instance
    }

    /**
     * highlight.js 초기화 및 설정
     */
    private initializeHighlighter(): void {
        // 자동 언어 감지 비활성화 (성능 향상)
        hljs.configure({
            ignoreUnescapedHTML: true,
            languages: Array.from(this.supportedLanguages)
        })
    }

    /**
     * 코드 구문 강조 실행
     * @param code 강조할 코드 문자열
     * @param language 프로그래밍 언어
     * @returns 구문 강조가 적용된 HTML 문자열
     */
    public highlight(code: string, language: string): string {
        try {
            // 입력 검증
            if (!code || typeof code !== 'string') {
                return this.escapeHtml('')
            }

            // 언어 정규화 (소문자, 별칭 처리)
            const normalizedLanguage = this.normalizeLanguage(language)

            // 지원하는 언어인지 확인
            if (this.isLanguageSupported(normalizedLanguage)) {
                const result = hljs.highlight(code, {
                    language: normalizedLanguage,
                    ignoreIllegals: true
                })
                return result.value
            } else {
                // 지원하지 않는 언어의 경우 자동 감지 시도
                const autoDetectResult = hljs.highlightAuto(code)

                // 자동 감지 신뢰도가 높으면 사용, 아니면 일반 텍스트로 처리
                if (autoDetectResult.relevance && autoDetectResult.relevance > 5) {
                    return autoDetectResult.value
                } else {
                    return this.escapeHtml(code)
                }
            }
        } catch (error) {
            console.warn(`Code highlighting failed for language "${language}":`, error)
            // 에러 발생 시 이스케이프된 원본 코드 반환
            return this.escapeHtml(code)
        }
    }

    /**
     * 언어명 정규화 (별칭 처리)
     * @param language 원본 언어명
     * @returns 정규화된 언어명
     */
    private normalizeLanguage(language: string): string {
        if (!language || typeof language !== 'string') {
            return 'plaintext'
        }

        const lang = language.toLowerCase().trim()

        // 언어 별칭 매핑
        const languageAliases: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            cs: 'csharp',
            'c++': 'cpp',
            'c#': 'csharp',
            html5: 'html',
            htm: 'html',
            yml: 'yaml',
            md: 'markdown',
            sh: 'shell',
            zsh: 'shell',
            fish: 'shell',
            ps1: 'powershell',
            pwsh: 'powershell',
            golang: 'go',
            rs: 'rust',
            rb: 'ruby',
            kt: 'kotlin',
            dockerfile: 'dockerfile',
            docker: 'dockerfile',
            text: 'plaintext',
            txt: 'plaintext'
        }

        return languageAliases[lang] || lang
    }

    /**
     * 언어 지원 여부 확인
     * @param language 확인할 언어명
     * @returns 지원 여부
     */
    public isLanguageSupported(language: string): boolean {
        const normalizedLanguage = this.normalizeLanguage(language)
        return (
            this.supportedLanguages.has(normalizedLanguage) ||
            hljs.getLanguage(normalizedLanguage) !== undefined
        )
    }

    /**
     * 지원하는 언어 목록 반환
     * @returns 지원하는 언어 배열
     */
    public getSupportedLanguages(): string[] {
        return Array.from(this.supportedLanguages).sort()
    }

    /**
     * HTML 특수문자 이스케이프
     * @param text 이스케이프할 텍스트
     * @returns 이스케이프된 텍스트
     */
    private escapeHtml(text: string): string {
        const htmlEscapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }

        return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char)
    }

    /**
     * 언어 표시명 반환 (사용자에게 보여줄 이름)
     * @param language 언어 코드
     * @returns 표시할 언어명
     */
    public getLanguageDisplayName(language: string): string {
        const normalizedLanguage = this.normalizeLanguage(language)

        const displayNameMap: Record<string, string> = {
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            python: 'Python',
            java: 'Java',
            csharp: 'C#',
            cpp: 'C++',
            c: 'C',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            sass: 'Sass',
            json: 'JSON',
            xml: 'XML',
            yaml: 'YAML',
            markdown: 'Markdown',
            sql: 'SQL',
            shell: 'Shell',
            bash: 'Bash',
            powershell: 'PowerShell',
            go: 'Go',
            rust: 'Rust',
            php: 'PHP',
            ruby: 'Ruby',
            swift: 'Swift',
            kotlin: 'Kotlin',
            dart: 'Dart',
            vue: 'Vue',
            jsx: 'JSX',
            tsx: 'TSX',
            dockerfile: 'Dockerfile',
            nginx: 'Nginx',
            apache: 'Apache',
            plaintext: 'Plain Text'
        }

        return (
            displayNameMap[normalizedLanguage] ||
            normalizedLanguage.charAt(0).toUpperCase() + normalizedLanguage.slice(1)
        )
    }
}

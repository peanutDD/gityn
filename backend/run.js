const execFileSync = require("child_process").execFileSync

const runCode = (language, code) => {
    try {
        switch (language) {
            case 'bash':
                return execFileSync('bash', ['-c', code]).toString()
            case 'php':
                return execFileSync('php', ['-r', code]).toString()
            case 'python':
                return execFileSync('python3', ['-c', code]).toString()
            case 'py':
                return execFileSync('python3', ['-c', code]).toString()
            case 'js':
                return execFileSync('node', ['-e', code]).toString()
            default:
                return `不支持 ${language} 语言`
        }
    } catch (e) {
        return e.message
    }
}

module.exports = { runCode }

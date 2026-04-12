/**
 * Converts a GitHub repository URL to a VS Code web URL
 * @param githubUrl - The GitHub repository URL (e.g., https://github.com/owner/repo)
 * @returns VS Code web URL or null if invalid
 * 
 * @example
 * getVSCodeUrl('https://github.com/vercel/next.js')
 * // Returns: 'https://vscode.dev/github/vercel/next.js'
 */
export const getVSCodeUrl = (githubUrl: string): string | null => {
  try {
    const url = new URL(githubUrl)

    // Validate it's a GitHub URL
    if (!url.hostname.includes('github.com')) {
      return null
    }

    // Extract owner/repo from pathname
    // pathname is like "/owner/repo" or "/owner/repo.git"
    let path = url.pathname.replace(/^\//, '') // Remove leading slash
    path = path.replace(/\.git$/, '') // Remove .git suffix if present

    // Validate path format (should be owner/repo)
    if (!path.includes('/')) {
      return null
    }

    return `https://vscode.dev/github/${path}`
  } catch {
    return null
  }
}

/**
 * Validates if a string is a valid GitHub URL
 * @param url - The URL to validate
 * @returns true if valid GitHub URL, false otherwise
 */
export const isValidGithubUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    if (!parsedUrl.hostname.includes('github.com')) {
      return false
    }
    const path = parsedUrl.pathname.replace(/^\//, '').replace(/\.git$/, '')
    return path.split('/').length === 2 // owner/repo
  } catch {
    return false
  }
}

/**
 * Extracts owner and repo from a GitHub URL
 * @param githubUrl - The GitHub repository URL
 * @returns Object with owner and repo, or null if invalid
 */
export const extractGithubInfo = (
  githubUrl: string
): { owner: string; repo: string } | null => {
  try {
    const url = new URL(githubUrl)

    if (!url.hostname.includes('github.com')) {
      return null
    }

    let path = url.pathname.replace(/^\//, '')
    path = path.replace(/\.git$/, '')

    const [owner, repo] = path.split('/')

    if (!owner || !repo) {
      return null
    }

    return { owner, repo }
  } catch {
    return null
  }
}

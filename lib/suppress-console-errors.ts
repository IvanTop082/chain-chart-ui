/**
 * Suppress Ant Design icon SVG attribute warnings and React 19 compatibility issues
 * Ant Design 4.x uses kebab-case (fill-rule) but React expects camelCase (fillRule)
 * Wallet adapter was built for React 17 but may show React 19 warnings
 */

if (typeof window !== 'undefined') {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    // Check all arguments, not just the first
    const messages = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.toString) return arg.toString();
      if (arg?.message) return arg.message;
      return '';
    }).join(' ');
    
    // Suppress Ant Design icon SVG attribute warnings
    if (
      messages.includes('Invalid DOM property `fill-rule`') ||
      (messages.includes('fill-rule') && messages.includes('fillRule')) ||
      messages.includes('fill-rule')
    ) {
      return; // Suppress - Ant Design icons use kebab-case, React wants camelCase
    }
    // Suppress React 19 ref warnings (wallet adapter compatibility)
    if (
      messages.includes('Accessing element.ref was removed') ||
      messages.includes('ref is now a regular prop') ||
      messages.includes('element.ref') ||
      (messages.includes('ref') && messages.includes('removed'))
    ) {
      return; // Suppress - wallet adapter uses React 17 patterns, Next.js 16 may use React 19 internally
    }
    originalError.apply(console, args);
  };
}


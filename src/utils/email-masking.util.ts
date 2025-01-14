export function maskEmailList(emails: string | string[], shouldMask: boolean): string[] {
    const maskEmail = (email: string): string => {
      const [local, domain] = email.split('@');
      const domainParts = domain.split('.');
      const maskedLocal = local.length > 3
        ? `${local.slice(0, 2)}******${local.slice(-2)}`
        : local.replace(/./g, '*');
      const maskedDomain = `${domainParts[0][0]}****${domainParts[0].slice(-1)}.${domainParts.slice(1).join('.')}`;
      return `${maskedLocal}@${maskedDomain}`;
    };
  
    // Normalize input to an array
    const emailArray = Array.isArray(emails) ? emails : [emails];
  
    // Mask emails if `shouldMask` is true, otherwise return original
    return emailArray.map(email => (shouldMask ? maskEmail(email) : email));
  }

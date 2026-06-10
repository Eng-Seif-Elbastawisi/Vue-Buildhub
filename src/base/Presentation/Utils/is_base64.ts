// function isBase64(str: any): boolean {
//   if (typeof str !== 'string') return false;

//   // remove base64 prefix if exists
//   const base64 = str.includes('base64,') ? str.split('base64,')[1] : str;

//   const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

//   return base64Regex.test(base64);
// }

// export default isBase64;

// new function
function isBase64(str: unknown): boolean {
  if (typeof str !== 'string') return false;

  const base64 = str.includes('base64,')
    ? str.split('base64,')[1] ?? ''
    : str;

  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  return base64Regex.test(base64);
}

export default isBase64;
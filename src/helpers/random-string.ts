export const randomString = (length: number) => {
  const CHARACTERS =
    "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * CHARACTERS.length);
    result += CHARACTERS.charAt(index);
  }
  return result;
};
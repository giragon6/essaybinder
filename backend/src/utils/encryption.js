const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.REFRESH_TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32); // 32 bytes key
const IV_LENGTH = 16;

const encryptRefreshToken = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipherGCM(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

const decryptRefreshToken = (encryptedData) => {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const decipher = crypto.createDecipherGCM(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

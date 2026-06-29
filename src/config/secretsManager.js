// Utility to fetch JWT secret from AWS Secrets Manager or fallback to process.env for dev
// In production set AWS_REGION and JWT_SECRET_NAME to let the app fetch the secret at startup.
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export async function getJwtSecret() {
  // If AWS config present, try to fetch the secret value
  if (process.env.AWS_REGION && process.env.JWT_SECRET_NAME) {
    try {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const cmd = new GetSecretValueCommand({ SecretId: process.env.JWT_SECRET_NAME });
      const resp = await client.send(cmd);
      if (resp.SecretString) {
        try {
          const parsed = JSON.parse(resp.SecretString);
          if (parsed.JWT_SECRET) return parsed.JWT_SECRET;
        } catch (err) {
          return resp.SecretString;
        }
      }
    } catch (err) {
      console.error('Erro ao obter secret do AWS Secrets Manager:', err.message || err);
    }
  }

  // Fallback to environment variable (suitable for local development)
  return process.env.JWT_SECRET;
}

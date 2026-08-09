import appHandler from '../server.ts';

export default async function handler(req: any, res: any) {
  return await appHandler(req, res);
}

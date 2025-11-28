import jwt from 'jsonwebtoken';
export function authMiddleware(req, res, next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'no token'});
  const token = h.replace('Bearer ','');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch(e){
    return res.status(401).json({error:'invalid token'});
  }
}
export function roleMiddleware(roles = []){
  return (req,res,next)=>{
    if(!roles.includes(req.userRole)) return res.status(403).json({error:'forbidden'});
    next();
  };
}

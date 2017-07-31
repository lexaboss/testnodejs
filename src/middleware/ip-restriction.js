import {IpFilter} from 'express-ipfilter';
import authConfig from '../configs/auth.json';
 
// whitelist the following IPs 
let ips = authConfig.allowedIps;

module.exports = IpFilter(ips, {mode: 'allow'});
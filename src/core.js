const ENGINE = ['force','maxSpeed','maxRPM','idleRPM','shiftUpRPM'];
const HANDLING = ['mass','centerOfMassHeightOffset','tireFriction','antiRoll','maxSteerAngle','rollingResistance','maxBrakeForce','tractionControlRatio','brakeAssistRatio','steeringLimitRatio','steeringAssistRatio'];
const PRESET = {force:60000,maxSpeed:300,tireFriction:4,antiRoll:0.7,centerOfMassHeightOffset:-0.4,rollingResistance:0.06,maxBrakeForce:400000,tractionControlRatio:1,brakeAssistRatio:1,steeringAssistRatio:0.8};
const SIX_RATIO = [3.0,2.2,1.6,1.2,0.9,0.7];
const SIX_FRAC = [0.15,0.30,0.45,185/300,0.8,1.0];

function keyBytes(name){const a=new Uint8Array(name.length+1);a[0]=name.length;for(let i=0;i<name.length;i++)a[i+1]=name.charCodeAt(i);return a;}
function findBytes(buf,pat,from=0,to=buf.length){
  const n=pat.length,last=Math.min(to,buf.length)-n;
  let i=buf.indexOf(pat[0],from);
  while(i!==-1&&i<=last){let k=1;while(k<n&&buf[i+k]===pat[k])k++;if(k===n)return i;i=buf.indexOf(pat[0],i+1);}
  return -1;
}
function parse(buf){
  const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);
  const fields={},missing=[];
  const grab=(names,anchor,lo,hi)=>{for(const n of names){
    const p=anchor<0?-1:findBytes(buf,keyBytes(n),Math.max(0,anchor-lo),anchor+hi);
    if(p<0){missing.push(n);continue;}
    const pos=p+1+n.length;fields[n]={pos,value:dv.getFloat32(pos,true)};}};
  grab(ENGINE,findBytes(buf,keyBytes('maxRPM')),200,200);
  grab(HANDLING,findBytes(buf,keyBytes('tireFriction')),400,1500);
  const ratio=[],shift=[];
  const gi=findBytes(buf,keyBytes('gears'));
  if(gi>=0){
    const r0=findBytes(buf,keyBytes('ratio'),gi),s0=findBytes(buf,keyBytes('shiftNextSpeed'),gi);
    if(r0>=5&&s0>=5&&buf[r0-5]===6&&buf[s0-5]===6){
      const rid=buf.slice(r0-4,r0),sid=buf.slice(s0-4,s0);
      ratio.push(r0+6);shift.push(s0+15);
      const eq=(i,id)=>buf[i]===id[0]&&buf[i+1]===id[1]&&buf[i+2]===id[2]&&buf[i+3]===id[3];
      for(let i=s0+15;i<buf.length-8;i++){
        if(buf[i]!==9)continue;
        if(eq(i+1,rid)){ratio.push(i+5);i+=8;}
        else if(eq(i+1,sid)){shift.push(i+5);i+=8;}
      }
    }
  }
  const n=Math.min(ratio.length,shift.length);
  const gears=[];const sets=[];let cur=null;
  for(let k=0;k<n;k++){
    const r=dv.getFloat32(ratio[k],true),s=dv.getFloat32(shift[k],true);
    if(!cur||s<gears[k-1].shift){cur=[];sets.push(cur);}
    gears.push({rpos:ratio[k],spos:shift[k],ratio:r,shift:s});cur.push(k);
  }
  return {fields,missing,gears,sets};
}
function autoFit(parsed,maxSpeed){
  const out=parsed.gears.map(g=>({ratio:g.ratio,shift:g.shift}));
  for(const set of parsed.sets){
    const n=set.length;
    set.forEach((gi,k)=>{
      if(n===6){out[gi]={ratio:SIX_RATIO[k],shift:Math.round(maxSpeed*SIX_FRAC[k])};}
      else{const r=n===1?1:3*Math.pow(0.7/3,k/(n-1));out[gi]={ratio:Math.round(r*100)/100,shift:Math.round(maxSpeed*(k+1)/n)};}
    });
  }
  return out;
}
function apply(buf,parsed,vals,gearVals){
  const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);
  for(const [n,f] of Object.entries(parsed.fields)){const v=vals[n];if(Number.isFinite(v))dv.setFloat32(f.pos,v,true);}
  parsed.gears.forEach((g,k)=>{const gv=gearVals&&gearVals[k];if(!gv)return;
    if(Number.isFinite(gv.ratio))dv.setFloat32(g.rpos,gv.ratio,true);
    if(Number.isFinite(gv.shift))dv.setFloat32(g.spos,gv.shift,true);});
}
if(typeof module!=='undefined')module.exports={parse,apply,autoFit,PRESET,ENGINE,HANDLING};

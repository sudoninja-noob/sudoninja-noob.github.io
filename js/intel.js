(async function(){
const l=document.getElementById("intel-list"),u=document.getElementById("intel-updated");
if(!l)return;
try{
const d=await fetch("data/mentions.json",{cache:"no-store"}).then(r=>r.json());
u.textContent="Last updated: "+new Date(d.updated).toLocaleString();
l.innerHTML="";
d.items.forEach(i=>{
l.innerHTML+=`<div class="service-card"><h3>${i.title}</h3><p class="muted">${i.source} • ${i.date}</p><p><b>Matched:</b> ${i.tags.join(", ")}</p><a href="${i.url}" target="_blank" class="btn small ghost">View Source</a></div>`;
});
}catch(e){u.textContent="Threat feed unavailable";}
})();
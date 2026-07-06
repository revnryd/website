const states=[
{label:"DISCOVER",title:"Find somewhere worth riding to.",description:"Discover nearby places, destinations, and experiences that give you a reason to get on the bike.",image:"assets/screenshots/explore-nearby.webp",width:1075,height:1120,alt:"Explore Nearby in Rev-N-Ryd"},
{label:"COMMUNITIES",title:"Find your people.",description:"Discover Circles and stay connected with riders beyond a single ride.",image:"assets/screenshots/circles.webp",width:1075,height:834,alt:"Circles you may know in Rev-N-Ryd"},
{label:"RIDES & EVENTS",title:"See what’s happening around you.",description:"Find local riding groups, meetups, and motorcycle experiences nearby.",image:"assets/screenshots/rides-events.webp",width:1077,height:1037,alt:"Rides and events happening nearby in Rev-N-Ryd"},
{label:"RIDE TOGETHER",title:"Stay together on the road.",description:"Plan rides with your friends, stay coordinated on the go, and see where everyone is as you ride.",image:"assets/screenshots/ride-creation.webp",width:1069,height:1353,alt:"Ride planning in Rev-N-Ryd"}
];
const tabs=[...document.querySelectorAll('[role="tab"]')],stage=document.querySelector(".product-stage"),copy=stage.querySelector(".product-copy"),shot=stage.querySelector(".product-shot"),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let current=0,timer=null,visible=false,hovered=false;
function preloadNext(index){const next=states[(index+1)%states.length];const img=new Image();img.src=next.image;}
function render(i,animate=true){const apply=()=>{current=i;tabs.forEach((t,n)=>t.setAttribute("aria-selected",n===i));copy.querySelector(".product-label").textContent=states[i].label;copy.querySelector("h3").textContent=states[i].title;copy.querySelector(".product-description").textContent=states[i].description;copy.querySelector(".counter").textContent=`0${i+1} / 04`;shot.src=states[i].image;shot.alt=states[i].alt;shot.width=states[i].width;shot.height=states[i].height;preloadNext(i);};if(!animate||reduce){apply();return}copy.classList.add("is-leaving");shot.classList.add("is-leaving");setTimeout(()=>{apply();copy.classList.remove("is-leaving");shot.classList.remove("is-leaving");copy.classList.add("is-entering");shot.classList.add("is-entering");requestAnimationFrame(()=>requestAnimationFrame(()=>{copy.classList.remove("is-entering");shot.classList.remove("is-entering")}));},260)}
function stop(){clearInterval(timer);timer=null}function start(){stop();if(!reduce&&visible&&!hovered)timer=setInterval(()=>render((current+1)%states.length),5000)}
tabs.forEach((tab,i)=>{tab.addEventListener("click",()=>{render(i);start()});tab.addEventListener("keydown",e=>{let n=current;if(e.key==="ArrowRight")n=(current+1)%4;else if(e.key==="ArrowLeft")n=(current+3)%4;else if(e.key==="Home")n=0;else if(e.key==="End")n=3;else return;e.preventDefault();tabs[n].focus();render(n);start()})});
stage.closest(".product-section").addEventListener("mouseenter",()=>{hovered=true;stop()});stage.closest(".product-section").addEventListener("mouseleave",()=>{hovered=false;start()});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?start():stop()},{threshold:.25}).observe(stage.closest(".product-section"));
document.addEventListener("visibilitychange",()=>document.hidden?stop():start());

const WAITLIST_ENDPOINT="https://script.google.com/macros/s/AKfycbysE8FjTSVTkzVqptTaSOJLw1vPw4uqDEl63-BtDFM5Y4RGB2tLrIAZCCG0EhN6ecMjAg/exec";
const form=document.getElementById("waitlistForm");
const email=document.getElementById("email");
const error=document.getElementById("emailError");
const submitButton=form.querySelector('button[type="submit"]');
const params=new URLSearchParams(window.location.search);

function waitlistPayload(){
  return {
    email:email.value.trim(),
    source:"website",
    utm_source:params.get("utm_source")||"",
    utm_medium:params.get("utm_medium")||"",
    utm_campaign:params.get("utm_campaign")||""
  };
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  error.textContent="";
  if(!email.validity.valid||!email.value.trim()){
    error.textContent="Please enter a valid email address.";
    email.focus();
    return;
  }

  const originalText=submitButton.textContent;
  submitButton.disabled=true;
  submitButton.textContent="Joining…";
  email.disabled=true;

  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);

  try{
    const response=await fetch(WAITLIST_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify(waitlistPayload()),
      signal:controller.signal,
      redirect:"follow"
    });

    if(!response.ok) throw new Error("Request failed");
    const result=await response.json();
    if(!result.success) throw new Error(result.message||"Unable to join the waitlist right now.");

    document.getElementById("formContent").hidden=true;
    const success=document.getElementById("successState");
    success.hidden=false;
    if(result.duplicate){
      success.querySelector("h3").textContent="You’re already on the list.";
      success.querySelector("p").textContent="We already have your email and will let you know when Rev-N-Ryd is ready to ride.";
    }
  }catch(err){
    error.textContent=err.name==="AbortError"
      ?"The request took too long. Please try again."
      :"Unable to join the waitlist right now. Please try again.";
    email.disabled=false;
    email.focus();
    submitButton.disabled=false;
    submitButton.textContent=originalText;
  }finally{
    clearTimeout(timeout);
  }
});

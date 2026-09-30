import { workshopPrototype as copy } from '../content/data'

// Temporary flat composition study, explicitly identified in the prototype.
// The native Blender owner creates the actual scene. No fabricated project data.
export function WorkshopStudy() {
  return <svg className="w-study" viewBox="0 0 900 760" role="img" aria-label={copy.sceneDescription}>
    <defs>
      <linearGradient id="w-room" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#73868b" /><stop offset=".4" stopColor="#425b68" /><stop offset="1" stopColor="#203c50" /></linearGradient>
      <linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#99bbc1" /><stop offset="1" stopColor="#e5d8af" /></linearGradient>
      <linearGradient id="w-wood" x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#c0986b" /><stop offset=".5" stopColor="#9f744e" /><stop offset="1" stopColor="#715037" /></linearGradient>
      <linearGradient id="w-arch" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c6b991" /><stop offset="1" stopColor="#78837a" /></linearGradient>
      <radialGradient id="w-lamp"><stop stopColor="#ffd78c" stopOpacity=".5" /><stop offset="1" stopColor="#ffcd7a" stopOpacity="0" /></radialGradient>
      <linearGradient id="w-floor" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#485d65" /><stop offset="1" stopColor="#8b8c78" /></linearGradient>
      <clipPath id="w-window"><path d="M227 382V211a104 104 0 0 1 208 0v171Z" /></clipPath>
      <clipPath id="w-monitor"><path d="m477 323 160 11-4 104-155-5Z" /></clipPath>
    </defs>
    <path d="M124 602V201l286-94 354 96v395L470 709Z" fill="url(#w-room)" />
    <path d="m410 107 354 96v395L470 709l-60-42Z" fill="#233f50" opacity=".3" />
    <path d="m124 602 286-46 354 42-294 111Z" fill="url(#w-floor)" />
    <path d="m163 618 281-51M226 641l283-63M297 666l287-76M365 684l290-82" stroke="#b4b09a" strokeWidth="2" opacity=".26" />
    <path d="M205 390V211a126 126 0 0 1 252 0v179Z" fill="url(#w-arch)" />
    <path d="M219 390V211a112 112 0 0 1 224 0v179Z" fill="#3d535b" />
    <g clipPath="url(#w-window)">
      <path d="M227 100h210v284H227Z" fill="url(#w-sky)" />
      <path d="m190 305 98-99 71 82 64-45 64 96v60H190Z" fill="#91b1b5" />
      <path d="m214 340 92-61 76 48 79-59 70 100H214Z" fill="#678e91" />
      <path d="m242 380 60-45 44 10 37-26 104 58Z" fill="#4c7577" />
      <path d="m252 176 49 4m58-23 42 3m-33 37 35 2" stroke="#f0eddb" strokeWidth="6" strokeLinecap="round" opacity=".58" />
    </g>
    <path d="M331 111v273M227 252h208" stroke="#78877c" strokeWidth="9" />
    <path d="m202 390 252-1 21 15-273 7Z" fill="#c3b48d" />
    <path d="m486 209 224 39v16l-226-39Z" fill="#997853" />
    <path d="m485 224 226 39v9l-227-39Z" fill="#3b3530" />
    <path d="m498 209 3-66 14 3-2 65Z" fill="#789887" /><path d="m516 213 4-76 19 4-2 76Z" fill="#d0b181" /><path d="m540 217 5-58 14 3-1 58Z" fill="#a86955" /><path d="m561 221 5-72 17 4-1 72Z" fill="#526d84" />
    <path d="m501 163 13 2m-13 29 12 2m11-40 14 2m-14 39 13 2m12-28 12 2m8-11 13 3m-14 35 13 3" stroke="#e9d7a9" strokeWidth="2" />
    <path d="m624 234-10-21 8-21 8 19 1 19 7-16 15-13 2 10-13 27Z" fill="#709588" /><path d="m616 231 35 7-6 26-24-5Z" fill="#c2a586" />
    <path d="m251 421 310-38 178 62-314 66Z" fill="url(#w-wood)" />
    <path d="m251 421 174 90v21l-173-87Zm174 90 314-66-2 19-312 68Z" fill="#684c38" />
    <path d="m277 456 18 9-3 153-20-9Zm417 16 18-4-12 166-20 6Zm-260 64 19-4 2 162-19-4Z" fill="#75543b" />
    <path d="m284 491 151 76 261-55" fill="none" stroke="#896a4b" strokeWidth="9" />
    <path d="m277 430 284-34 134 45-271 57Z" fill="none" stroke="#dfb981" strokeWidth="2" opacity=".55" />
    <path d="m470 313 177 12-5 123-170-4Z" fill="#263e48" stroke="#cea872" strokeWidth="5" />
    <image href={copy.caseStudy.image} x="477" y="323" width="160" height="116" preserveAspectRatio="xMidYMid slice" clipPath="url(#w-monitor)" />
    <path d="m550 445 17 1v21l29 6-60 11-24-9 38-7Z" fill="#3c5054" />
    <path d="m417 463 42-8 72 21-40 10Z" fill="#e2ceb0" /><path d="m439 463 70 19m-66-25 74 20" stroke="#a79377" strokeWidth="2" />
    <path d="m294 438 64-7 54 23-65 12Z" fill="#d5c29d" /><path d="m296 435 63-9 54 24-67 11Z" fill="#f0e3c0" /><path d="m359 426-12 35" stroke="#bd9d6b" strokeWidth="2" />
    <path d="m307 438 36-5m-26 11 24-3m29-8 20 9m-24-5 23 10" stroke="#a99571" strokeWidth="1.5" />
    <ellipse cx="660" cy="397" rx="115" ry="133" fill="url(#w-lamp)" />
    <path d="m662 315-17 105 22 8 14-4-22-6 16-102Z" fill="#c3aa75" /><path d="m620 304 36-45 44 53-30 16Z" fill="#d6b77b" /><path d="m623 306 45 17 29-12-40-12Z" fill="#ffe0a1" />
    <path d="m404 403 13-42 16 38-13 20Z" fill="#8ac1b9" stroke="#c4e3c9" strokeWidth="2" /><path d="m417 361 3 58m-16-16 29-4" stroke="#bce2d7" strokeWidth="1" />
    <path d="m386 415 32-8 30 8-25 8Z" fill="#b69d70" /><path d="m390 418 33 10 24-10v6l-23 11-34-11Z" fill="#79654c" />
    <path d="m159 458 26-33 14 22 11-17 16 47-35-15Z" fill="#6f9286" /><path d="m164 456 49 16-8 42-34-14Z" fill="#b59475" />
    <path d="m171 501 38 14-1 25-39-13Z" fill="#274e59" opacity=".24" />
    <path d="m178 177 11-3m-5-5-1 12m553 214 11 3m-6-8-1 13m-15 74 6 2" stroke="#e3cd98" strokeWidth="2" strokeLinecap="round" opacity=".8" />
    <path d="m124 602 346 107 294-111" fill="none" stroke="#c8b78f" strokeWidth="2" opacity=".5" />
  </svg>
}

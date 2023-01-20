import { useState } from "react";
import { useLocation } from "react-router-dom";
import RemixDark from "~/assets/img/remix-dark.png";

export default function TopBanner() {
  const location = useLocation();
  const [open, setOpen] = useState(true);

  function getRoute(item: number, path: string) {
    let host = "";
    switch (item) {
      case 0:
        host = "https://vue2.saasfrontends.com";
        break;
      case 1:
        host = "https://vue3.saasfrontends.com";
        break;
      case 2:
        host = "https://react.saasfrontends.com";
        break;
      case 3:
        host = "https://svelte.saasfrontends.com";
        break;
    }
    if (path !== undefined) {
      host += path;
    }
    return host;
  }
  function updateRoute(item: number) {
    window.location.replace(getRoute(item, ""));
  }
  function getRouteInVue2() {
    return getRoute(0, location.pathname);
  }
  function getRouteInVue3() {
    return getRoute(1, location.pathname);
  }
  function getRouteInReact() {
    return getRoute(2, location.pathname);
  }
  function getRouteInSvelte() {
    return getRoute(3, location.pathname);
  }
  function getRouteInRemix() {
    return getRoute(4, location.pathname);
  }
  return (
    <span>
      {open && (
        <div className="bg-slate-900 border-b-2 border-yellow-500 shadow-2xl">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <div className="w-full lg:w-auto lg:justify-end flex items-center space-x-3">
              <div className="flex-grow">
                <div className="flex sm:hidden">
                  <div className="w-full">
                    <select
                      id="framework-or-library"
                      name="framework-or-library"
                      className="bg-slate-800 text-slate-400 block w-full pl-3 pr-10 py-2 text-base border-gray-700 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                      onChange={(e) => updateRoute(Number(e.target.value))}
                      value={2}
                    >
                      <option value={0}>Vue2</option>
                      <option value={1}>Vue3</option>
                      <option value={2}>React</option>
                      <option value={3}>Svelte</option>
                      <option value={4}>Remix</option>
                    </select>
                  </div>
                </div>
                <div className="hidden sm:flex font-extrabold items-center space-x-1">
                  <a
                    href={getRouteInVue2()}
                    className="w-16 text-center border border-transparent rounded-md px-1 py-1 font-extrabold shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 hover:bg-slate-800 text-slate-400"
                  >
                    Vue2
                  </a>
                  <a
                    href={getRouteInVue3()}
                    className="w-16 text-center border border-transparent rounded-md px-1 py-1 font-extrabold shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 hover:bg-slate-800 text-slate-400"
                  >
                    Vue3
                  </a>
                  <a
                    href={getRouteInReact()}
                    className="w-16 text-center border border-transparent rounded-md px-1 py-1 font-extrabold shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 hover:bg-slate-800 text-slate-400"
                  >
                    React
                  </a>
                  <a
                    href={getRouteInSvelte()}
                    className="w-16 text-center border border-transparent rounded-md px-1 py-1 font-extrabold shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 hover:bg-slate-800 text-slate-400"
                  >
                    Svelte
                  </a>
                  <a className="w-16 text-center border border-transparent rounded-md px-1 py-1 font-extrabold shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-theme-800 bg-theme-100 border-theme-100 select-none">
                    Remix
                  </a>
                </div>
              </div>
              <div className="hidden md:flex items-center truncate">
                <div className="flex items-center space-x-2 truncate">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 172 172">
                    <g
                      fill="none"
                      fillRule="nonzero"
                      stroke="none"
                      strokeWidth="1"
                      strokeLinecap="butt"
                      strokeLinejoin="miter"
                      strokeMiterlimit="10"
                      strokeDasharray=""
                      strokeDashoffset="0"
                      fontFamily="none"
                      fontWeight="none"
                      fontSize="none"
                      textAnchor="none"
                    >
                      <path d="M0,172v-172h172v172z" fill="none"></path>
                      <g fill="#3b82f6">
                        <circle cx="12" cy="11.999" transform="scale(7.16667,7.16667)" r="2.147"></circle>
                        <path d="M32.35033,113.2405c1.51217,0.50167 3.02433,1.0105 4.57233,1.44767c-0.50167,2.01383 -0.93883,3.999 -1.34733,6.04867c-3.526,18.64767 -0.774,33.42533 8.02667,38.49933c9.073,5.23883 24.32367,-0.13617 39.173,-13.1365c1.17533,-1.03917 2.35067,-2.11417 3.526,-3.26083c1.47633,1.44767 3.02433,2.82367 4.56517,4.16383c14.37633,12.3625 28.58783,17.36483 37.35983,12.298c9.073,-5.23883 12.02567,-21.12733 8.19867,-40.47733c-0.301,-1.47633 -0.63783,-2.9885 -1.0105,-4.5365c1.075,-0.301 2.11417,-0.63783 3.1605,-0.97467c19.38583,-6.41417 33.42533,-16.79867 33.42533,-27.44833c0,-10.17667 -13.23683,-20.05233 -31.51183,-26.3375v-0.00717c-1.81317,-0.602 -3.62633,-1.17533 -5.4395,-1.71283c0.301,-1.23983 0.57333,-2.48683 0.8385,-3.72667c4.13517,-20.02367 1.41183,-36.10567 -7.7615,-41.41617c-8.8365,-5.074 -23.24867,0.20067 -37.82567,12.9c-1.44767,1.23983 -2.85233,2.55133 -4.19967,3.86283c-0.91017,-0.87433 -1.849,-1.74867 -2.78783,-2.58717c-15.2865,-13.57367 -30.60167,-19.2855 -39.775,-13.93917c-8.80067,5.10983 -11.42367,20.26017 -7.72567,39.1945c0.37267,1.88483 0.774,3.72667 1.23983,5.6115c-2.15,0.602 -4.26417,1.27567 -6.24933,1.98517c-17.93817,6.2135 -30.80233,16.02467 -30.80233,26.17267c0,10.48483 13.70267,20.99117 32.35033,27.37667zM78.03783,140.61c-5.53983,5.074 -11.96117,9.10167 -18.94867,11.86083c-3.72667,1.77733 -8.02667,1.94933 -11.86083,0.43717c-5.33917,-3.08883 -7.56083,-14.94967 -4.5365,-30.90983c0.37267,-1.87767 0.774,-3.7625 1.23983,-5.6115c7.525,1.6125 15.1145,2.72333 22.8115,3.2895c4.43617,6.28517 9.30233,12.298 14.5125,17.93817c-1.075,1.03917 -2.15,2.04967 -3.225,2.9885zM120.701,77.529c-1.57667,-2.95983 -3.18917,-5.9125 -4.87333,-8.80067c-1.64833,-2.85233 -3.36117,-5.676 -5.1385,-8.46383c5.41083,0.67367 10.58517,1.57667 15.42267,2.6875c-1.548,4.97367 -3.36117,9.81117 -5.41083,14.577zM120.7655,94.256c2.15,4.87333 4.03483,9.81117 5.676,14.88517c-5.21017,1.17533 -10.47767,2.0855 -15.78817,2.6875c1.81317,-2.82367 3.526,-5.71183 5.21017,-8.6c1.71283,-2.95983 3.32533,-5.94833 4.902,-8.97267zM116.88117,85.89967c-2.25033,4.63683 -4.67267,9.202 -7.25267,13.70267c-2.55133,4.46483 -5.27467,8.80067 -8.127,13.10067c-5.00233,0.37267 -10.2125,0.5375 -15.48717,0.5375c-5.27467,0 -10.37733,-0.16483 -15.31517,-0.473c-2.924,-4.26417 -5.676,-8.63583 -8.26317,-13.10067c-2.58717,-4.46483 -4.97367,-9.00133 -7.224,-13.63817h-0.01433c2.2145,-4.63683 4.63683,-9.17333 7.18817,-13.63817c2.55133,-4.46483 5.3105,-8.80067 8.19867,-13.06483c5.03817,-0.37267 10.17667,-0.57333 15.42267,-0.57333c5.246,0 10.41317,0.20067 15.42267,0.57333c2.85233,4.2355 5.57567,8.56417 8.16283,13.00033c2.58717,4.43617 5.00233,8.97267 7.2885,13.57367zM56.12933,68.79283c-1.64833,2.85233 -3.26083,5.76917 -4.773,8.729c-2.11417,-5.00233 -3.89867,-9.90433 -5.375,-14.6415c4.8375,-1.075 9.976,-1.94933 15.31517,-2.623c-1.77017,2.78783 -3.51883,5.64017 -5.16717,8.5355zM51.3635,94.52117v0c1.548,2.95983 3.12467,5.88383 4.80167,8.772c1.71283,2.924 3.4615,5.848 5.3105,8.70033c-5.23883,-0.57333 -10.449,-1.41183 -15.5875,-2.52267c1.47633,-4.8375 3.32533,-9.83983 5.47533,-14.94967zM86.27233,132.44v0c-3.42567,-3.69083 -6.85133,-7.783 -10.17667,-12.1905c3.225,0.13617 6.55033,0.20067 9.9115,0.20067c3.4615,0 6.85133,-0.0645 10.2125,-0.2365c-3.08883,4.26417 -6.41417,8.33483 -9.94733,12.22633zM130.1825,142.53067v0c-0.30817,4.09217 -2.322,7.91917 -5.547,10.50633c-5.33917,3.08883 -16.727,-0.93883 -29.025,-11.48817c-1.41183,-1.21117 -2.82367,-2.52267 -4.26417,-3.86283c5.1385,-5.676 9.87567,-11.68883 14.17567,-18.00267c7.68983,-0.63783 15.351,-1.81317 22.91183,-3.526c0.33683,1.376 0.63783,2.752 0.91017,4.09933c1.64833,7.25983 1.9135,14.8135 0.8385,22.274zM133.09933,64.72933c1.74867,0.50167 3.42567,1.03917 5.03817,1.57667c15.652,5.375 26.6385,13.373 26.6385,19.48617c0,6.58617 -11.72467,15.08583 -28.4875,20.62567c-0.93883,0.301 -1.87767,0.602 -2.85233,0.87433c-2.35067,-7.32433 -5.23883,-14.47667 -8.56417,-21.4355c3.225,-6.85133 5.94833,-13.9105 8.22733,-21.12733zM95.03,31.003v0c12.50583,-10.879 24.15883,-15.14317 29.46933,-12.09017c5.676,3.26083 7.86183,16.426 4.3,33.72633c-0.2365,1.1395 -0.473,2.25033 -0.774,3.36117c-7.4605,-1.677 -15.01417,-2.88817 -22.61083,-3.56183c-4.3645,-6.2565 -9.1375,-12.2335 -14.31183,-17.845c1.3115,-1.23983 2.58717,-2.41517 3.92733,-3.5905zM86.07167,39.73917c3.526,3.827 6.85133,7.85467 9.94017,12.0185c-6.65067,-0.301 -13.33717,-0.301 -19.98783,0c3.2895,-4.32867 6.6865,-8.35633 10.04767,-12.0185zM47.09933,19.14933c5.64733,-3.2895 18.17467,1.41183 31.37567,13.10067c0.8385,0.73817 1.677,1.548 2.55133,2.35067c-5.21017,5.60433 -10.01183,11.58133 -14.41217,17.83067c-7.5895,0.67367 -15.1145,1.849 -22.575,3.49733c-0.43717,-1.71283 -0.80267,-3.4615 -1.17533,-5.21017c-3.1605,-16.26117 -1.075,-28.51617 4.2355,-31.56917zM33.16017,66.50667c1.9135,-0.67367 3.86283,-1.27567 5.81217,-1.849c2.28617,7.2885 5.03817,14.448 8.22733,21.36383c-3.225,7.02333 -6.01283,14.276 -8.32767,21.66483l-0.00717,0.00717c-1.41183,-0.40133 -2.78783,-0.8385 -4.16383,-1.3115c-7.15233,-2.25033 -15.2865,-5.81217 -21.16317,-10.47767c-3.38983,-2.35067 -5.676,-5.977 -6.31383,-10.04767c0,-6.149 10.61383,-14.01083 25.93617,-19.35z"></path>
                      </g>
                    </g>
                  </svg>
                  <img className="h-5 w-auto mx-auto" src={RemixDark} alt="Logo" />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="h-9" viewBox="-5 -15 60 60" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M25.517 0C18.712 0 14.46 3.382 12.758 10.146c2.552-3.382 5.529-4.65 8.931-3.805 1.941.482 3.329 1.882 4.864 3.432 2.502 2.524 5.398 5.445 11.722 5.445 6.804 0 11.057-3.382 12.758-10.145-2.551 3.382-5.528 4.65-8.93 3.804-1.942-.482-3.33-1.882-4.865-3.431C34.736 2.92 31.841 0 25.517 0zM12.758 15.218C5.954 15.218 1.701 18.6 0 25.364c2.552-3.382 5.529-4.65 8.93-3.805 1.942.482 3.33 1.882 4.865 3.432 2.502 2.524 5.397 5.445 11.722 5.445 6.804 0 11.057-3.381 12.758-10.145-2.552 3.382-5.529 4.65-8.931 3.805-1.941-.483-3.329-1.883-4.864-3.432-2.502-2.524-5.398-5.446-11.722-5.446z"
                      fill="#38bdf8"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-shrink-0 order-2 mt-0 w-auto">
                <a
                  href="https://alexandromg.gumroad.com/l/SaasFrontends-Remix"
                  target="_blank"
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm sm:text-sm font-medium text-yellow-900 bg-yellow-400 hover:bg-yellow-500"
                >
                  Get codebase!
                </a>
              </div>
              <div className="flex-shrink-0 order-3 ml-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-mr-1 flex p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:-mr-2"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

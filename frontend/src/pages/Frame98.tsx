import imgImage from "figma:asset/1a9e0e8878613487294e7215de79373e57451b83.png";
import imgImage1 from "figma:asset/86e58c3bb3163662d76efead9d80ddc1765dea15.png";
import imgImage2 from "figma:asset/88b56aff28999cfbb23ea383c6b23ddcb0b2e80d.png";
import img from "figma:asset/dc363e39d3908994ff42099fc60ed260785d0125.png";
import imgImage3 from "figma:asset/9571e2936d7314ac574962d4b21c9c25763fd82e.png";
import imgFrame98 from "figma:asset/a36b2ed5de6f4dd11d0ce3ddd51e20b15b3b4375.png";
import imgGotBadgeTop from "figma:asset/2484795c531ae1ff3b598deb6738eb29826b028d.png";
import imgImage4 from "figma:asset/9c33715d28b9826486fa39950beb92c68010aef6.png";

var svgPaths={
pe89b200: "M1 7.89846L5.65646 12.7274L12.21 1",
}
interface ImageProps {
  property1?: "רגיל" | "small_no_name";
}

function Image({ property1 = "רגיל" }: ImageProps) {
  if (property1 === "small_no_name") {
    return (
      <div className="relative size-full" data-name="Property 1=small_no_name">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative size-full">
          <div
            className="absolute aspect-[50/50] left-0 right-0 top-1/2 translate-y-[-50%]"
            data-name="image"
          >
            <img
              className="block max-w-none size-full"
              height="30"
              src={imgImage}
              width="30"
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative size-full" data-name="Property 1=רגיל">
      <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative size-full">
        <div className="relative shrink-0 size-[60px]" data-name="image">
          <img
            className="block max-w-none size-full"
            height="59.99999237060547"
            src={imgImage1}
            width="59.99999237060547"
          />
        </div>
        <div
          className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
          style={{ width: "min-content" }}
        >
          <p className="block leading-[normal]" dir="rtl">
            משה מרילוס
          </p>
        </div>
      </div>
    </div>
  );
}

interface OffProps {
  number?: string;
  name?: string;
  howMany?: string;
}

function Off({ number = "3", name = "פותח השיחות", howMany = "3" }: OffProps) {
  return (
    <div className="relative rounded-lg size-full" data-name="off">
      <div className="relative overflow-clip size-full">
        <div className="absolute h-[79px] left-2 top-[22px] w-36">
          <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
            <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
              <p className="block leading-[normal]" dir="auto">
                {name}
              </p>
            </div>
            <div className="relative opacity-75 shrink-0">
              <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
                <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
                  <p
                    className="block leading-[normal] text-nowrap whitespace-pre"
                    dir="auto"
                  >
                    איש זכו בדרגה זו
                  </p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
                  <p
                    className="block leading-[normal] text-nowrap whitespace-pre"
                    dir="auto"
                  >
                    {howMany}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
          style={{ top: "calc(50% + 1px)" }}
        >
          <p className="block leading-[normal] whitespace-pre" dir="auto">
            {number}
          </p>
        </div>
        <div
          className="absolute contents left-[158.987px] translate-y-[-50%]"
          style={{ top: "calc(50% + 0.00244141px)" }}
        >
          <div
            className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
            data-name="image"
          >
            <img
              className="block max-w-none size-full"
              height="82.9951171875"
              src={imgImage2}
              width="82.9951171875"
            />
          </div>
        </div>
      </div>
      <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
    </div>
  );
}

function Frame153() {
  return (
    <div className="absolute bg-[#4ab7b1] bottom-[63.383%] left-[0.084%] right-0 top-[34.908%]">
      <div className="relative flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-2.5 py-[39px] relative size-full">
          <div className=" font-normal leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[25px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre" dir="auto">
              חברים בדרגה שלכם
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame154() {
  return (
    <div className="absolute bg-[#4ab7b1] bottom-[53.823%] left-[0.084%] right-0 top-[44.469%]">
      <div className="relative flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-2.5 py-[39px] relative size-full">
          <div className=" font-normal leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[25px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre" dir="auto">
              רשימת הדרגות
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame155() {
  return (
    <div className="absolute bg-[#4ab7b1] bottom-[75.217%] left-[0.084%] right-0 top-[23.075%]">
      <div className="relative flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-2.5 py-[39px] relative size-full">
          <div className=" font-normal leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[25px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre" dir="auto">
              הדרגה הבאה
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame103() {
  return (
    <div
      className="absolute left-[6.238%] right-[6.393%] translate-y-[-50%]"
      style={{ top: "calc(50% - 341.189px)" }}
    >
      <div className="[flex-flow:wrap] box-border content-start flex gap-[9px] items-start justify-center p-0 relative w-full">
        <div className="relative shrink-0" data-name="image">
          <Image />
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                דני גמבום
              </p>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                ישראל לורנץ
              </p>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                רם טרשתי
              </p>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                אליכם הכהן כראזי
              </p>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                רפי כהן
              </p>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" data-name="image">
          <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative">
            <div className="relative shrink-0 size-[60px]" data-name="image">
              <img
                className="block max-w-none size-full"
                height="59.99999237060547"
                loading="lazy"
                src={imgImage1}
                width="59.99999237060547"
              />
            </div>
            <div
              className="-webkit-box css-ywbagn  font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#ffffff] text-[11px] text-center"
              style={{ width: "min-content" }}
            >
              <p className="block leading-[normal]" dir="rtl">
                שלמה לוי
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame158() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#000000] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame157() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מתחמם
          </p>
        </div>
        <Frame158 />
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents left-[158.987px] top-1/2 translate-y-[-50%]">
      <div className="absolute left-[159px] size-[83px] top-[22px]">
        <div className="absolute bottom-[-8.434%] left-[-4.819%] right-[-7.229%] top-[-3.614%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 93 93"
          >
            <g filter="url(#filter0_d_1_242)" id="Ellipse 13">
              <circle
                cx="45.5"
                cy="44.5"
                fill="var(--fill-0, #EEEEEE)"
                r="41.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="93"
                id="filter0_d_1_242"
                width="93"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="effect1_dropShadow_1_242"
                />
                <feOffset dx="1" dy="2" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_1_242"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1_242"
                  mode="normal"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={img}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame159() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#000000] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame160() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#000000] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            שובר קרחים
          </p>
        </div>
        <Frame159 />
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents left-[158.987px] top-1/2 translate-y-[-50%]">
      <div className="absolute left-[159px] size-[83px] top-[22px]">
        <div className="absolute bottom-[-8.434%] left-[-4.819%] right-[-7.229%] top-[-3.614%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 93 93"
          >
            <g filter="url(#filter0_d_1_242)" id="Ellipse 13">
              <circle
                cx="45.5"
                cy="44.5"
                fill="var(--fill-0, #EEEEEE)"
                r="41.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="93"
                id="filter0_d_1_242"
                width="93"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="effect1_dropShadow_1_242"
                />
                <feOffset dx="1" dy="2" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_1_242"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1_242"
                  mode="normal"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={img}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame163() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame164() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            השראה מהלכת
          </p>
        </div>
        <Frame163 />
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame165() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame166() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מגדלור אנושי
          </p>
        </div>
        <Frame165 />
      </div>
    </div>
  );
}

function Group14() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame167() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame168() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            נוגע בלבבות
          </p>
        </div>
        <Frame167 />
      </div>
    </div>
  );
}

function Group15() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame169() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame170() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מעמיק הקשרים
          </p>
        </div>
        <Frame169 />
      </div>
    </div>
  );
}

function Group16() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame171() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame172() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מרים המסיבות
          </p>
        </div>
        <Frame171 />
      </div>
    </div>
  );
}

function Group17() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame173() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame174() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מקהיל קהילות
          </p>
        </div>
        <Frame173 />
      </div>
    </div>
  );
}

function Group18() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame175() {
  return (
    <div className="relative opacity-75 shrink-0">
      <div className="box-border content-stretch flex flex-row  font-normal gap-1 items-center justify-center leading-[0] not-italic p-0 relative text-[#ffffff] text-nowrap text-right">
        <div className="flex flex-col justify-center relative shrink-0 text-[13px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            איש זכו בדרגה זו
          </p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 text-[11px]">
          <p
            className="block leading-[normal] text-nowrap whitespace-pre"
            dir="auto"
          >
            3
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame176() {
  return (
    <div className="absolute h-[79px] left-2 top-[22px] w-36">
      <div className="box-border content-stretch flex flex-col gap-[17px] h-[79px] items-end justify-center p-0 relative w-36">
        <div className="flex flex-col font-['Inter:Bold',_sans-serif] font-bold h-2.5 justify-center leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[19px] text-right w-full">
          <p className="block leading-[normal]" dir="auto">
            מאחד הלבבות
          </p>
        </div>
        <Frame175 />
      </div>
    </div>
  );
}

function Group19() {
  return (
    <div
      className="absolute contents left-[158.987px] translate-y-[-50%]"
      style={{ top: "calc(50% + 0.00244141px)" }}
    >
      <div
        className="absolute left-[158.987px] size-[82.995px] top-[22.005px]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82.9951171875"
          loading="lazy"
          src={imgImage2}
          width="82.9951171875"
        />
      </div>
    </div>
  );
}

function Frame156() {
  return (
    <div
      className="absolute left-[14.138%] right-[16.385%] translate-y-[-50%]"
      style={{ top: "calc(50% + 685.49px)" }}
    >
      <div className="box-border content-stretch flex flex-col gap-[29px] items-start justify-start p-0 relative w-full">
        <div
          className="bg-[#fae3ff] h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="on"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame157 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                1
              </p>
            </div>
            <Group9 />
            <div className="absolute h-[11.727px] left-[14.15px] top-[98px] w-[11.21px]">
              <div className="absolute bottom-[-14.191%] left-[-6.421%] right-[-7.787%] top-[-4.16%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 14 15"
                >
                  <path
                    d={svgPaths.pe89b200}
                    id="Vector 4"
                    stroke="var(--stroke-0, #039902)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute border border-[#925b03] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="bg-[#fae3ff] h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="on"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame160 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic opacity-20 text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                2
              </p>
            </div>
            <Group10 />
            <div className="absolute h-[11.727px] left-[14.15px] top-[98px] w-[11.21px]">
              <div className="absolute bottom-[-14.191%] left-[-6.421%] right-[-7.787%] top-[-4.16%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 14 15"
                >
                  <path
                    d={svgPaths.pe89b200}
                    id="Vector 4"
                    stroke="var(--stroke-0, #039902)"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute border border-[#925b03] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="off"
        >
          <Off />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 37"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame164 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                4
              </p>
            </div>
            <Group13 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 29"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame166 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                5
              </p>
            </div>
            <Group14 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 30"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame168 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                6
              </p>
            </div>
            <Group15 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 31"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame170 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                8
              </p>
            </div>
            <Group16 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 32"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame172 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                9
              </p>
            </div>
            <Group17 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 33"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame174 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                9
              </p>
            </div>
            <Group18 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
        <div
          className="h-[127px] relative rounded-lg shrink-0 w-[299px]"
          data-name="Component 34"
        >
          <div className="h-[127px] overflow-clip relative w-[299px]">
            <Frame176 />
            <div
              className="absolute flex flex-col  font-normal justify-center leading-[0] left-[251px] not-italic text-[#898888] text-[17px] text-left text-nowrap translate-y-[-50%]"
              style={{ top: "calc(50% + 1px)" }}
            >
              <p className="block leading-[normal] whitespace-pre" dir="auto">
                10
              </p>
            </div>
            <Group19 />
          </div>
          <div className="absolute border-4 border-[#fae3ff] border-solid inset-0 pointer-events-none rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]" />
        </div>
      </div>
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute bottom-[72.008%] contents left-[60.15%] right-[20.564%] top-[25.589%]">
      <div className="absolute bottom-[72.008%] left-[60.15%] right-[20.564%] top-[25.589%]">
        <div className="absolute bottom-[-8.434%] left-[-4.819%] right-[-7.229%] top-[-3.614%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 93 93"
          >
            <g filter="url(#filter0_d_1_242)" id="Ellipse 13">
              <circle
                cx="45.5"
                cy="44.5"
                fill="var(--fill-0, #EEEEEE)"
                r="41.5"
              />
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="93"
                id="filter0_d_1_242"
                width="93"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  result="hardAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="effect1_dropShadow_1_242"
                />
                <feOffset dx="1" dy="2" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="effect1_dropShadow_1_242"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1_242"
                  mode="normal"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className="absolute bottom-[72.037%] left-[60.382%] right-[20.564%] top-[25.589%]"
        data-name="image"
      >
        <img
          className="block max-w-none size-full"
          height="82"
          loading="lazy"
          src={imgImage3}
          width="82"
        />
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute bottom-[72.008%] contents left-[20.648%] right-[20.564%] top-[25.589%]">
      <div className="absolute bottom-[72.79%] flex flex-col  font-normal justify-center leading-[0] left-[20.648%] not-italic right-[44.498%] text-[#ffffff] text-[26px] text-right top-[26.313%]">
        <p className="block leading-[normal]" dir="auto">
          פותח השיחות
        </p>
      </div>
      <Group20 />
    </div>
  );
}

export default function Frame98() {
  return (
    <div
      className="relative bg-center bg-no-repeat bg-cover size-full"
      style={{ backgroundImage: `url('${imgFrame98}')` }}
    >
      <div
        className="absolute h-[3453.34px] left-[-0.36px] top-[-0.336px] w-[430.36px]"
        data-name="Component 38"
      >
        <div className="absolute bg-[#41115e] bottom-0 left-[0.084%] right-0 top-[8.066%]" />
        <div
          className="absolute bg-center bg-cover bg-no-repeat bottom-[91.934%] left-0 right-0 top-0"
          data-name="got-badge-top"
          style={{ backgroundImage: `url('${imgGotBadgeTop}')` }}
        />
        <div className="absolute bottom-[89.178%]  font-normal leading-[0] left-[10.517%] not-italic right-[10.433%] text-[#ffffff] text-[32px] text-center top-[9.693%]">
          <p className="block leading-[normal]" dir="auto">
            כל הכבוד! עלית בדרגה!
          </p>
        </div>
        <Frame153 />
        <Frame154 />
        <Frame155 />
        <div
          className="absolute bottom-[83.199%] left-[30.04%] right-[30.435%] top-[11.876%]"
          data-name="image"
        >
          <div className="absolute inset-[-18.813%]">
            <img
              className="block max-w-none size-full"
              height="234.0986328125"
              src={imgImage4}
              width="234.0986328125"
            />
          </div>
        </div>
        <div className="absolute bottom-[80.524%]  font-normal leading-[0] left-[21.472%] not-italic right-[23.284%] text-[#ffffff] text-[32px] text-center top-[17.797%]">
          <p className="block leading-[normal]" dir="auto">
            שובר קרחים
          </p>
        </div>
        <Frame103 />
        <div className="absolute bg-[#41115e] bottom-[91.934%] left-[0.084%] right-0 rounded-tl-[30px] rounded-tr-[30px] top-[7.365%]" />
        <div className="absolute bottom-[77.921%] flex flex-col  font-normal justify-center leading-[0] left-[10.517%] not-italic right-[5.711%] text-[#ffffff] text-[20px] text-center top-[19.473%] tracking-[0.2px]">
          <p className="adjustLetterSpacing block leading-[30px]" dir="auto">
            עבודה מצויינת! תמשיכו לשחק!
            <br />
            זה מגבש את הקבוצה, ועושה טוב לאנושות.
          </p>
        </div>
        <Frame156 />
        <Group12 />
        <div className="absolute bottom-[69.662%]  font-normal leading-[0] left-[12.279%] not-italic right-[16.153%] text-[#ffffff] text-[19px] text-center top-[28.716%]">
          <p className="leading-[28px]" dir="auto">
            <span>{`על מנת להגיע לדרגת `}</span>
            <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
              פותח השיחות
            </span>
            <span>{` עליכם לקבל 400 נקודות`}</span>
          </p>
        </div>
        <div className="absolute bottom-[65.99%]  font-normal leading-[0] left-[13.093%] not-italic right-[15.339%] text-[#ffffff] text-[15px] text-center top-[32.562%]">
          <p className="leading-[25px] mb-0" dir="auto">
            <span>{`יש לכם `}</span>
            <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
              382
            </span>
            <span>{` נקודות`}</span>
          </p>
          <p className="leading-[25px]" dir="auto">
            <span>{`נשארו לכם רק עוד `}</span>
            <span className="font-['Inter:Bold',_sans-serif] font-bold not-italic">
              18
            </span>
            <span>{` למעבר לדרגה הבאה`}</span>
          </p>
        </div>
        <div className="absolute bg-[#d9d9d9] bottom-[68.159%] left-[11.815%] right-[11.97%] rounded-[27px] top-[31.059%]" />
        <div className="absolute bg-[#539203] bottom-[68.159%] left-[11.815%] right-[24.285%] rounded-[27px] top-[31.059%]" />
        <div className="absolute bottom-[3.495%]  font-normal leading-[0] left-[13.811%] not-italic right-[21.36%] text-[#ffffff] text-[23px] text-center top-[94.189%]">
          <p
            className="block leading-[normal]"
            dir="auto"
          >{`כל עליה שלכם בדרגה משקפת שינוי גדול שאתם יוצרים בעולם. `}</p>
        </div>
      </div>
    </div>
  );
}
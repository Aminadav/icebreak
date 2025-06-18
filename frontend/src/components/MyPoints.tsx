import { usePoints } from "../contexts/GameContext";


export default function MyPoints(): JSX.Element {
  var {points}=usePoints();
  return (
    <div className={`text-white absolute end-5 align-middle top-5`}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">
        {points}
        </span>
        נקודות
      </div>
    </div>
  );
}

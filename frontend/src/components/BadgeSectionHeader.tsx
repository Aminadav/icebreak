interface BadgeSectionHeaderProps {
  title: string;
}

export function BadgeSectionHeader({ title }: BadgeSectionHeaderProps) {
  return (
    <div className="bg-[#4ab7b1] flex flex-row items-center justify-center relative w-full">
      <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-2.5 py-5 relative w-full">
        <div className=" font-normal leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[25px] text-center text-nowrap">
          <p className="block leading-[normal] whitespace-pre" dir="auto">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
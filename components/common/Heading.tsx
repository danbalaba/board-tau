import React from "react";
import BackButton from "./BackButton";
import HelpTooltip from "./HelpTooltip";

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  backBtn?: boolean;
  helpText?: string;
  rightAction?: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({
  title,
  subtitle,
  center,
  backBtn = false,
  helpText,
  rightAction,
}) => {
  return (
    <div className="w-full">
      <div className={center ? "text-center flex flex-col items-center" : "text-start"}>
        <div className="flex items-start justify-between gap-3 w-full">
          <div className="flex items-center">
            <h3 className="text-2xl font-bold leading-[1.25] text-text-primary dark:text-gray-100">{title}</h3>
            {helpText && <div className="ml-2 mt-1"><HelpTooltip text={helpText} /></div>}
          </div>
          {/* Desktop Top-Right Action */}
          {rightAction && (
            <div className="hidden md:block shrink-0">{rightAction}</div>
          )}
          {backBtn ? <BackButton /> : null}
        </div>
        
        <p className="font-light text-text-secondary dark:text-gray-400 md:mt-1 mt-2">{subtitle}</p>

        {/* Mobile Below-Subtitle Action */}
        {rightAction && (
          <div className="flex md:hidden justify-end mt-2 shrink-0">{rightAction}</div>
        )}
      </div>
    </div>
  );
};

export default Heading;

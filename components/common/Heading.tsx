import React from "react";
import BackButton from "./BackButton";
import HelpTooltip from "./HelpTooltip";

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  backBtn?: boolean;
  helpText?: string;
}

const Heading: React.FC<HeadingProps> = ({
  title,
  subtitle,
  center,
  backBtn = false,
  helpText,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className={center ? "text-center flex flex-col items-center" : "text-start"}>
        <div className="flex items-center">
          <h3 className="text-2xl font-bold leading-[1.25] text-text-primary dark:text-gray-100">{title}</h3>
          {helpText && <div className="ml-2 mt-1"><HelpTooltip text={helpText} /></div>}
        </div>
        <p className="font-light text-text-secondary dark:text-gray-400 md:mt-1 mt-2">{subtitle}</p>
      </div>
      {backBtn ? <BackButton /> : null}
    </div>
  );
};

export default Heading;

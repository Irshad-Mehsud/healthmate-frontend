import { FileText, Activity, CircleDot } from "lucide-react";

const Timeline = () => {
  const events = [
    {
      type: "report",
      title: "Sugar Level Test",
      date: "Oct 12, 2023",
      detail: "Normal",
    },
    {
      type: "vital",
      title: "Manual Entry: BP",
      date: "Oct 10, 2023",
      detail: "130/85",
    },
    {
      type: "report",
      title: "X-Ray Result",
      date: "Oct 05, 2023",
      detail: "Consult Doctor",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-3 sm:px-4">
      <h3 className="text-xl sm:text-2xl font-extrabold mb-8 text-slate-900 dark:text-white">
        Your Medical Journey
      </h3>

      <div className="relative border-l-2 border-indigo-200 dark:border-slate-700 ml-4 sm:ml-6">
        {events.map((event, index) => {
          const isReport = event.type === "report";

          return (
            <div key={index} className="mb-10 ml-6 sm:ml-10 relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-10 sm:-left-14 top-1 
                w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center 
                border-4 border-white dark:border-slate-900 shadow-md 
                transition-transform group-hover:scale-110
                ${isReport ? "bg-indigo-600" : "bg-emerald-500"}`}
              >
                {isReport ? (
                  <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                ) : (
                  <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                )}
              </div>

              {/* Card */}
              <div
                className="p-4 sm:p-6 rounded-2xl 
  bg-amber-50 dark:bg-amber-900/10 
  border-l-4 border-amber-400
  shadow-sm 
  transition-all duration-300 
  hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CircleDot className="w-3 sm:w-4 h-3 sm:h-4 text-amber-500" />

                  <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                    {event.date}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {event.title}
                </h4>

                <p
                  className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold
    ${isReport ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}`}
                >
                  {event.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;

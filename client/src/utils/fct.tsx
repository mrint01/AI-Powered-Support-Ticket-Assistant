  // A reusable functional React component for formatting and displaying a date string.
  import React from "react";

  interface FormatDateProps {
    dateString: string;
    className?: string;
  }

  /**
   * FormatDate
   * Usage: <FormatDate dateString={someDateString} />
   * Optionally pass className for styling.
   */
  const FormatDate: React.FC<FormatDateProps> = ({ dateString, className }) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? " PM" : " AM";
    hour = hour % 24; // keep 0-23
    const hourStr = String(hour).padStart(2, "0");
    const formatted = `${year}-${month}-${day} ${hourStr}:${minute}${ampm}`;
    return <span className={className}>{formatted}</span>;
  };

  export default FormatDate;
import React from "react";

interface Tab {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div className="tabs">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children }) => {
  return <div className="tabs-list">{children}</div>;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, disabled, className, onClick, children }) => {
  return (
    <button
      className={`tab-trigger ${className} ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
  return <div className={`tab-content ${className}`}>{children}</div>;
};
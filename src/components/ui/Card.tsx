import React from 'react';
import { cn } from '../../utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={cn(
            "bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl shadow-sm p-6",
            className
        )}>
            {children}
        </div>
    );
};

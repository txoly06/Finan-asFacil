import React from 'react';
import { cn } from '../../utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
    return (
        <div className={cn("bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100", className)} {...props}>
            {children}
        </div>
    );
};

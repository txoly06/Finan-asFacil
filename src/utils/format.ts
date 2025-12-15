import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateFull = (date: string | Date): string => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

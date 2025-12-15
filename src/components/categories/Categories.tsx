import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useFinancial } from '../../context/FinancialContext';
import { Plus, Trash2, Tag } from 'lucide-react';
import type { Category } from '../../types';

export const Categories: React.FC = () => {
    const { categories, addCategory, deleteCategory } = useFinancial();
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
        name: '',
        color: '#3B82F6',
        type: 'despesa'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addCategory(newCategory);
            setIsAdding(false);
            setNewCategory({ name: '', color: '#3B82F6', type: 'despesa' });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar categoria');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza? Isso não afetará transações antigas.')) {
            await deleteCategory(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Categorias
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Nova Categoria
                </button>
            </div>

            {isAdding && (
                <Card className="p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory.name}
                                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                                <select
                                    value={newCategory.type}
                                    onChange={e => setNewCategory({ ...newCategory, type: e.target.value as 'receita' | 'despesa' })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="despesa">Despesa</option>
                                    <option value="receita">Receita</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Cor</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={newCategory.color}
                                        onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                                        className="h-10 w-10 bg-transparent border-none rounded cursor-pointer"
                                    />
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-gray-400">
                                        {newCategory.color}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
                        <Tag size={20} /> Despesas
                    </h3>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'despesa').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="font-medium">{cat.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {categories.filter(c => c.type === 'despesa').length === 0 && (
                            <p className="text-gray-500 text-center py-4">Nenhuma categoria de despesa</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                        <Tag size={20} /> Receitas
                    </h3>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'receita').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="font-medium">{cat.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {categories.filter(c => c.type === 'receita').length === 0 && (
                            <p className="text-gray-500 text-center py-4">Nenhuma categoria de receita</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

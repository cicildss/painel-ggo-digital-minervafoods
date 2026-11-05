import React from 'react';
import { SearchX, Database, FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'search' | 'data' | 'filter';
  title?: string;
  description?: string;
  theme?: 'light' | 'dark';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'search',
  title,
  description,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const config = {
    search: {
      Icon: SearchX,
      defaultTitle: 'Nenhum resultado encontrado',
      defaultDesc: 'Tente ajustar os termos de busca ou remover filtros aplicados.',
      color: '#94a3b8'
    },
    data: {
      Icon: Database,
      defaultTitle: 'Sem dados disponíveis',
      defaultDesc: 'Não há registros para exibir com os filtros selecionados.',
      color: '#94a3b8'
    },
    filter: {
      Icon: FileQuestion,
      defaultTitle: 'Sem itens para exibir',
      defaultDesc: 'Nenhum registro corresponde ao filtro atual. Tente uma seleção diferente.',
      color: '#94a3b8'
    }
  };

  const { Icon, defaultTitle, defaultDesc, color } = config[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl border border-dashed transition-colors ${
        isDark ? 'bg-[#141b25]/50 border-slate-700/60' : 'bg-slate-50/80 border-slate-200'
      }`}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 opacity-60"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {title ?? defaultTitle}
      </h3>
      <p className={`text-xs leading-relaxed max-w-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {description ?? defaultDesc}
      </p>
    </div>
  );
};

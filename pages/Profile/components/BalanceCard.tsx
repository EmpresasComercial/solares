import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatCurrency, CurrencyType } from '../../../lib/currency';

interface BalanceCardProps {
  recharge: number;
  profit: number;
  withdrawn: number;
  teamCommission: number;
  currency: CurrencyType;
  onRecharge: () => void;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  recharge,
  profit,
  withdrawn,
  teamCommission,
  currency,
  onRecharge,
  onWithdraw
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 px-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#F5F5F5] rounded-[14px] py-3 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-400 font-light mb-0.5">Recarregar</p>
          <p className="text-[14px] font-medium text-[#C62828]">{formatCurrency(recharge, currency)}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-[14px] py-3 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-400 font-light mb-0.5">Lucro</p>
          <p className="text-[14px] font-medium text-[#1A237E]">{formatCurrency(profit, currency)}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-[14px] py-3 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-400 font-light mb-0.5">Total retirada</p>
          <p className="text-[14px] font-medium text-red-500">{formatCurrency(withdrawn, currency)}</p>
        </div>
        <div className="bg-[#F5F5F5] rounded-[14px] py-3 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] text-gray-400 font-light mb-0.5">Comissões equipe</p>
          <p className="text-[14px] font-medium text-[#E65100]">{formatCurrency(teamCommission, currency)}</p>
        </div>
      </div>

      {/* Botões de Acção */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onRecharge}
          className="h-[46px] rounded-[23px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[14px] transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {t('profile.recharge')}
        </button>
        <button
          onClick={onWithdraw}
          className="h-[46px] rounded-[23px] bg-[#F5F5F5] text-[#333333] font-medium text-[14px] transition-all hover:bg-gray-200 active:scale-[0.98]"
        >
          {t('profile.withdraw')}
        </button>
      </div>
    </div>
  );
};

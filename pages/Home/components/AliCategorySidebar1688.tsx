import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  Sparkles, 
  Tent, 
  Briefcase, 
  Sparkle, 
  UtensilsCrossed, 
  Coffee, 
  Tv, 
  Lightbulb, 
  Wrench, 
  ChevronRight 
} from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  subtitles: string[];
  icon: React.ReactNode;
  tags: { name: string; items: string[] }[];
}

export const AliCategorySidebar1688: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<CategoryItem | null>(null);

  const categories: CategoryItem[] = [
    {
      id: 'vestuario',
      title: '女装、男装、内衣',
      subtitles: ['Vestuário Feminino', 'Masculino', 'Íntimo'],
      icon: <Shirt className="w-4 h-4 text-pink-500" />,
      tags: [
        { name: 'Moda Feminina', items: ['Vestidos', 'Conjuntos', 'Jeans', 'Camisas', 'Moletons', 'Saias'] },
        { name: 'Moda Masculina', items: ['Camisetas', 'Calças Casual', 'Camisas Polo', 'Jaquetas', 'Bermudas'] },
        { name: 'Roupas Íntimas', items: ['Moda Praia', 'Pijamas de Seda', 'Conjuntos Térmicos', 'Lingerie B2B'] }
      ]
    },
    {
      id: 'acessorios',
      title: '配饰、鞋、箱包',
      subtitles: ['Calçados', 'Bolsas & Malas', 'Acessórios'],
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      tags: [
        { name: 'Calçados Populares', items: ['Tênis Esportivos', 'Sapatos Sociais', 'Sandálias', 'Botas Industriais'] },
        { name: 'Bolsas & Malas', items: ['Mochilas Executivas', 'Malas de Viagem', 'Bolsas Femininas', 'Carteiras'] },
        { name: 'Óculos & Acessórios', items: ['Óculos de Sol', 'Relógios de Luxo', 'Cintos em Couro', 'Joalheria'] }
      ]
    },
    {
      id: 'esporte',
      title: '运动户外、玩具童装',
      subtitles: ['Esportes', 'Ar Livre', 'Brinquedos'],
      icon: <Tent className="w-4 h-4 text-emerald-500" />,
      tags: [
        { name: 'Camping & Pesca', items: ['Barracas', 'Varas de Pesca', 'Lanternas LED', 'Mesas Dobráveis'] },
        { name: 'Brinquedos & Games', items: ['Blocos de Montar', 'Drones RC', 'Bonecos Colecionáveis', 'Jogos'] },
        { name: 'Fitness & Ginástica', items: ['Tapetes Yoga', 'Halteres', 'Bicicletas Ergométricas', 'Kits Treino'] }
      ]
    },
    {
      id: 'papelaria',
      title: '办公文化、宠物园艺',
      subtitles: ['Papelaria', 'Pets', 'Jardinagem'],
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
      tags: [
        { name: 'Material Escritório', items: ['Canetas Especiais', 'Cadernos B2B', 'Calculadoras', 'Organização'] },
        { name: 'Pet Shop Fábrica', items: ['Camas Pet', 'Rações Premium', 'Coleiras Inteligentes', 'Higiene'] },
        { name: 'Jardinagem & Vasos', items: ['Vasos Cerâmica', 'Ferramentas de Jardim', 'Irrigadores', 'Sementes'] }
      ]
    },
    {
      id: 'beleza',
      title: '美妆个护、收纳清洁',
      subtitles: ['Beleza', 'Cuidados Pessoais', 'Limpeza'],
      icon: <Sparkle className="w-4 h-4 text-rose-500" />,
      tags: [
        { name: 'Cosméticos & Makes', items: ['Batom & Gloss', 'Bases & Corretivos', 'Pincéis de Maquiagem', 'Cílios'] },
        { name: 'Cuidados com a Pele', items: ['Séruns Faciais', 'Máscaras Hidratantes', 'Protetor Solar', 'Cremes'] },
        { name: 'Higiene & Limpeza', items: ['Toalhas Umedecidas', 'Sabonetes Líquidos', 'Organizadores Acrílico'] }
      ]
    },
    {
      id: 'alimentos',
      title: '食品酒水、餐饮生鲜',
      subtitles: ['Alimentos', 'Bebidas', 'Snacks'],
      icon: <UtensilsCrossed className="w-4 h-4 text-orange-500" />,
      tags: [
        { name: 'Snacks & Biscoitos', items: ['Castanhas & Nozes', 'Chocolates', 'Frutas Secas', 'Biscoitos Finos'] },
        { name: 'Bebidas & Cafés', items: ['Café em Grãos', 'Chás Nobres', 'Sucos Naturais', 'Bebidas Lácteas'] },
        { name: 'Ingredientes B2B', items: ['Farinhas Especiais', 'Condimentos', 'Molhos Orientais', 'Especiarias'] }
      ]
    },
    {
      id: 'cozinha',
      title: '日用餐厨、居家日用',
      subtitles: ['Cozinha', 'Utilidades Domésticas'],
      icon: <Coffee className="w-4 h-4 text-yellow-600" />,
      tags: [
        { name: 'Panelas & Utensílios', items: ['Jogos de Panelas', 'Frigideiras Cerâmica', 'Facas de Chef', 'Tábua de Corte'] },
        { name: 'Copos & Garrafas', items: ['Copos Térmicos', 'Garrafas Inox', 'Xícaras de Café', 'Jarras de Vidro'] },
        { name: 'Utilidades do Lar', items: ['Guarda-chuvas', 'Varal Retrátil', 'Caixas Herméticas', 'Ganchos'] }
      ]
    },
    {
      id: 'eletronicos',
      title: '家用电器、数码电脑',
      subtitles: ['Eletrodomésticos', 'Eletrônicos', 'TI'],
      icon: <Tv className="w-4 h-4 text-indigo-500" />,
      tags: [
        { name: 'Energia & Solar', items: ['Painéis Solares 550W', 'Inversores Híbridos', 'Controladores MPPT', 'Baterias'] },
        { name: 'Acessórios Celular', items: ['Fones Bluetooth', 'Carregadores Rápidos', 'Power Banks', 'Cabos Tipo-C'] },
        { name: 'Eletroportáteis', items: ['Air Fryers', 'Aspiradores Robô', 'Liquidificadores', 'Ventiladores'] }
      ]
    },
    {
      id: 'decoracao',
      title: '家装灯饰、家纺家饰',
      subtitles: ['Iluminação', 'Móveis', 'Têxteis Lar'],
      icon: <Lightbulb className="w-4 h-4 text-teal-500" />,
      tags: [
        { name: 'Iluminação Solar & LED', items: ['Luminárias Solares', 'Fitas LED Smart', 'Refletores 200W', 'Lustres'] },
        { name: 'Cama, Mesa e Banho', items: ['Jogos de Cama 400 Fios', 'Toalhas Felpudas', 'Edredons', 'Cortinas'] },
        { name: 'Móveis & Quadros', items: ['Poltronas Decorativas', 'Mesas de Centro', 'Quadros Canvas', 'Espelhos'] }
      ]
    },
    {
      id: 'industrial',
      title: '汽车用品、工业用品',
      subtitles: ['Automotivo', 'Ferramentas', 'Indústria'],
      icon: <Wrench className="w-4 h-4 text-cyan-600" />,
      tags: [
        { name: 'Acessórios Automotivos', items: ['Suportes Celular', 'Câmeras Veiculares', 'Aspiradores Portáteis', 'Capas'] },
        { name: 'Ferramentas Manuais & Elétricas', items: ['Furadeiras de Impacto', 'Kits Chaves', 'Serras', 'Multímetros'] },
        { name: 'Embalagens Industriais', items: ['Caixas de Papelão', 'Plástico Bolha', 'Fitas de Alta Aderência'] }
      ]
    }
  ];

  return (
    <div 
      className="relative bg-white rounded-2xl shadow-xs border border-gray-100 p-2.5 w-full flex flex-col font-sans"
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 px-2">
        <h3 className="text-[14px] font-extrabold text-gray-900 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#FF5000] rounded-full" />
          <span>全部类目 • Categorias de Fábrica</span>
        </h3>
        <span className="text-[10.5px] font-bold text-[#FF5000] bg-orange-50 px-2 py-0.5 rounded-full">
          10 Grandes Setores
        </span>
      </div>

      <div className="flex flex-col mt-1 divide-y divide-gray-50">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onMouseEnter={() => setHoveredCategory(cat)}
            onClick={() => navigate('/produtos')}
            className="flex items-center justify-between py-2 px-2 rounded-xl hover:bg-orange-50/70 active:bg-orange-100 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                {cat.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-bold text-gray-800 group-hover:text-[#FF5000] transition-colors truncate">
                  {cat.title}
                </span>
                <span className="text-[10px] text-gray-400 truncate">
                  {cat.subtitles.join(' • ')}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#FF5000] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </div>
        ))}
      </div>

      {/* Flyout Drawer / Subcategorias Flutuantes quando Hover em Desktop */}
      {hoveredCategory && (
        <div className="hidden lg:block absolute left-[101%] top-0 w-[540px] min-h-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <span className="text-[16px] font-black text-gray-900">
              {hoveredCategory.title}
            </span>
            <span className="text-[12px] text-[#FF5000] font-semibold">
              ({hoveredCategory.subtitles.join(' / ')})
            </span>
          </div>

          <div className="space-y-4">
            {hoveredCategory.tags.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-[12px] font-bold text-gray-800 tracking-wide uppercase">
                  {group.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      type="button"
                      onClick={() => navigate('/produtos')}
                      className="text-[11.5px] text-gray-600 hover:text-[#FF5000] hover:bg-orange-50 border border-gray-200 hover:border-orange-200 px-2.5 py-1 rounded-md transition-all cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Mais de 5.000 fábricas certificadas prontas para entrega
            </span>
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="text-[12px] font-bold text-white bg-[#FF5000] hover:bg-[#E03E00] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Ver Todos os Lotes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

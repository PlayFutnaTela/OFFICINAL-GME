'use client';

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Tipos para os dados
type TimelineData = {
  month: string;
  opportunities: number;
  value: number;
};

type PipelineData = {
  name: string;
  value: number;
};

type ActiveProductsByCategoryData = {
  category: string;
  count: number;
  percent: number;
};

interface DashboardChartsProps {
  topProducts: { name: string; price: number }[]; // top 5 products
  timelineData: TimelineData[]; // month, opportunities, value (revenue)
  pipelineData: PipelineData[];
  conversionRateData?: { stage: string; conversionRate: number }[]; // Novo tipo para taxa de conversÃ£o
  avgValueByCategoryData?: { category: string; avgValue: number }[]; // Novo tipo para valor mÃ©dio por categoria
  valueDistributionData?: { range: string; count: number }[]; // Novo tipo para distribuiÃ§Ã£o de valor
  topSellingProductsData?: { name: string; sold: number; revenue: number }[]; // Novo tipo para produtos mais vendidos
  activeProductFinancials?: { label: string; value: number }[]; // Totais financeiros produtos ativos
  activeProductsByCategoryData?: ActiveProductsByCategoryData[];
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#FBBF24'];

export default function DashboardCharts({
  topProducts,
  timelineData,
  pipelineData,
  conversionRateData = [],
  avgValueByCategoryData = [],
  valueDistributionData = [],
  topSellingProductsData = [],
  activeProductFinancials = [],
  activeProductsByCategoryData = []
}: DashboardChartsProps) {

  const currencyFormatter = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const FinancialTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-gray-800 text-white p-2 rounded text-xs">
          <p className="font-semibold">{entry.payload.label}</p>
          <p>{currencyFormatter(entry.value)}</p>
        </div>
      );
    }
    return null;
  };

  const ActiveCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-gray-800 text-white p-2 rounded text-xs">
          <p className="font-semibold">{entry.payload.category}</p>
          <p>{entry.value} produtos</p>
          <p>{entry.payload.percent.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* GrÃ¡fico de Taxa de ConversÃ£o por EstÃ¡gio do Funil */}
      {conversionRateData && conversionRateData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Taxa de ConversÃ£o por EstÃ¡gio do Funil</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Mostra a porcentagem de oportunidades que avanÃ§am de um estÃ¡gio para o prÃ³ximo no funil de vendas
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversionRate" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GrÃ¡fico de Valor MÃ©dio por Oportunidade por Categoria */}
      {avgValueByCategoryData && avgValueByCategoryData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Valor MÃ©dio por Oportunidade por Categoria</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Mostra o valor mÃ©dio das oportunidades em cada categoria, ajudando a identificar quais categorias geram oportunidades mais valiosas
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgValueByCategoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis label={{ value: 'Valor MÃ©dio (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgValue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Barras - Totais Financeiros de Produtos Ativos */}
      {activeProductFinancials && activeProductFinancials.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Produtos Ativos — Totais Financeiros</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Compara o valor total dos produtos ativos com o montante de comissão atrelado a eles.
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeProductFinancials} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={currencyFormatter} label={{ value: 'Valor (R$)', position: 'insideBottomRight' }} />
              <YAxis dataKey="label" type="category" width={200} />
              <Tooltip content={<FinancialTooltip />} />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* GrÃ¡fico de DistribuiÃ§Ã£o de Oportunidades por Valor */}
      {valueDistributionData && valueDistributionData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">DistribuiÃ§Ã£o de Oportunidades por Valor</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Mostra como as oportunidades estÃ£o distribuÃ­das em diferentes faixas de valor, ajudando a entender o perfil dos negÃ³cios
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valueDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GrÃ¡fico de Produtos Mais Vendidos */}
      {topSellingProductsData && topSellingProductsData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Produtos Mais Vendidos</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Mostra os produtos mais vendidos em termos de quantidade, ajudando a identificar os produtos de maior sucesso
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sold" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de Rosca - Produtos Ativos por Categoria */}
      {activeProductsByCategoryData && activeProductsByCategoryData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Produtos Ativos por Categoria (percentual)</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Percentual de produtos com status ativo distribuído por categoria
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activeProductsByCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                fill="#8884d8"
                dataKey="count"
                label={({ name, percent = 0 }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
              >
                {activeProductsByCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ActiveCategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GrÃ¡fico de Barras - Top 5 Produtos Mais Caros */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Top 5 Produtos Mais Caros</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Lista os 5 produtos com os valores mais altos
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="price" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GrÃ¡fico de Linhas - EvoluÃ§Ã£o no Faturamento */}
      {timelineData && timelineData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">EvoluÃ§Ã£o no Faturamento</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Mostra a evoluÃ§Ã£o do faturamento e nÃºmero de oportunidades ao longo do tempo
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Faturamento (R$)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Oportunidades', angle: 90, position: 'insideRight' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} name="Faturamento (R$)" />
              <Line yAxisId="right" type="monotone" dataKey="opportunities" stroke="#3B82F6" strokeWidth={2} name="Oportunidades" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* GrÃ¡fico de Barras - Pipeline de Vendas */}
      {pipelineData && pipelineData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border overflow-visible">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">Pipeline de Vendas</h3>
            <div className="tooltip-group relative">
              <div className="tooltip-trigger cursor-help text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="tooltip-content absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                Representa visualmente as etapas do funil de vendas e quantas oportunidades estÃ£o em cada estÃ¡gio
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

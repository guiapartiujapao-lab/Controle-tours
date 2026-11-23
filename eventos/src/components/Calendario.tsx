"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIA_MAP } from "@/lib/categorias";

type EventoMini = {
  id: string;
  slug: string;
  titulo: string;
  categoria: string;
  dataInicio: string;
  cidade: string;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendario({ eventos }: { eventos: EventoMini[] }) {
  const hoje = new Date();
  const [cursor, setCursor] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const eventosNoMes = useMemo(() => {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    return eventos
      .map((e) => ({ ...e, dataObj: new Date(e.dataInicio) }))
      .filter((e) => e.dataObj.getFullYear() === ano && e.dataObj.getMonth() === mes);
  }, [eventos, cursor]);

  const dias = useMemo(() => {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0);
    const offset = primeiro.getDay();
    const total = ultimo.getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const navMes = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  const eventosPorDia = (d: number) =>
    eventosNoMes.filter((e) => e.dataObj.getDate() === d);

  return (
    <section className="card-3d p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navMes(-1)}
          className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:border-pink-500 hover:text-pink-600 text-slate-600 shadow-sm font-bold"
        >
          ‹
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {MESES[cursor.getMonth()]} <span className="text-slate-500 font-normal">{cursor.getFullYear()}</span>
        </h2>
        <button
          onClick={() => navMes(1)}
          className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:border-pink-500 hover:text-pink-600 text-slate-600 shadow-sm font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-slate-500 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dias.map((d, i) => {
          if (d === null) return <div key={i} className="aspect-square" />;
          const ehHoje =
            sameDay(new Date(cursor.getFullYear(), cursor.getMonth(), d), hoje);
          const doDia = eventosPorDia(d);
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg border p-1.5 flex flex-col text-left ${
                ehHoje
                  ? "border-pink-500 bg-pink-50"
                  : doDia.length > 0
                  ? "border-slate-300 bg-white hover:border-pink-400"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <span
                className={`text-xs font-bold mb-1 ${
                  ehHoje ? "text-pink-600" : doDia.length > 0 ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {d}
              </span>
              <div className="flex flex-wrap gap-1 items-center flex-1 content-start">
                {doDia.slice(0, 3).map((e) => {
                  const cat = CATEGORIA_MAP[e.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
                  return (
                    <Link
                      key={e.id}
                      href={`/eventos/${e.slug}`}
                      title={`${e.titulo} · ${e.cidade}`}
                      className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm hover:scale-125 transition"
                      style={{ background: cat.cor }}
                    />
                  );
                })}
                {doDia.length > 3 && (
                  <span className="text-[10px] text-slate-500 font-bold leading-none">
                    +{doDia.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {eventosNoMes.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            Eventos deste mês ({eventosNoMes.length})
          </h3>
          <div className="space-y-2">
            {eventosNoMes
              .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime())
              .map((e) => {
                const cat = CATEGORIA_MAP[e.categoria as keyof typeof CATEGORIA_MAP] || CATEGORIA_MAP.OUTRO;
                return (
                  <Link
                    key={e.id}
                    href={`/eventos/${e.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                  >
                    <span
                      className="w-10 text-center text-sm font-bold rounded-md py-1"
                      style={{ background: cat.cor + "22", color: cat.cor }}
                    >
                      {e.dataObj.getDate()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{e.titulo}</p>
                      <p className="text-xs text-slate-500">
                        {cat.emoji} {cat.label} · {e.cidade}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {eventosNoMes.length === 0 && (
        <p className="text-center text-sm text-slate-500 mt-5 pt-4 border-t border-slate-200">
          Nenhum evento neste mês.
        </p>
      )}
    </section>
  );
}

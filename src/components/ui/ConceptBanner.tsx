"use client";

import React from "react";

export default function ConceptBanner() {
  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
      {/* Effet lumineux de fond */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Icône illustrative */}
        <div className="shrink-0 w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/40 shadow-inner">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Texte du concept */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Le concept : <span className="text-amber-400">Vos pièces, ma main d'œuvre</span>
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
            En tant que mécanicien à domicile, je vous facture <strong className="text-white">uniquement la main d'œuvre</strong>. 
            C'est simple : <strong className="text-white">vous achetez vous-même vos pièces détachées</strong> au meilleur prix sur internet ou en magasin (Oscaro, Autodoc, etc.), et je viens avec tout mon équipement professionnel pour réaliser le montage chez vous !
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-amber-300/80">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Pas de marge sur les pièces
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Transparence totale
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Zéro déplacement pour vous
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

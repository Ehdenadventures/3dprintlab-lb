-- Filament types per product (PLA, PETG, Silk PLA...), each with an extra price.
-- Run this once in Supabase > SQL Editor.
-- materials = list of {"name": "PETG", "extra": 2}; extra is added to the product price (0 = same price).
-- Colours can also carry an extra price ("extra" inside variants); that needs no database change.

alter table products add column if not exists materials jsonb not null default '[]'::jsonb;

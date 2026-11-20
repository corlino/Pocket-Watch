-- Additional themes (decisions.md): Dark Red, Dark Purple, Yellow.
-- New enum labels only; existing rows and the 'dark' default are unchanged.
alter type public.appearance add value if not exists 'dark-red';
alter type public.appearance add value if not exists 'dark-purple';
alter type public.appearance add value if not exists 'yellow';

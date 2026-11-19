-- OpenStreetMap import identity for safe, repeatable imports.
alter table public.restaurants
  add column if not exists osm_type text,
  add column if not exists osm_id bigint;

create unique index if not exists restaurants_osm_identity_uidx
  on public.restaurants (osm_type, osm_id)
  where osm_type is not null and osm_id is not null;

comment on column public.restaurants.osm_type is 'OpenStreetMap element type (node, way, relation)';
comment on column public.restaurants.osm_id is 'OpenStreetMap element numeric ID';

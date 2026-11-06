// Hosts for the views whose behaviour still lives in data/js (Hub, Wünsche, Map, Admin). They render
// fixed markup once; App mounts the modules into it. memo + constant props: React never re-renders them.
import { memo } from 'react';
import { ADMIN_HTML, MAP_HTML, WUENSCHE_HTML } from './host-markup';

export const HubHost = memo(function HubHost() {
  return (
    <section className="view view-hub" id="view-hub" aria-label="Community Hub">
      <div className="wrap" id="hub-root" />
    </section>
  );
});

export const WishesHost = memo(function WishesHost() {
  return <section className="view wrap view-page" id="view-wuensche" aria-labelledby="wuensche-title" dangerouslySetInnerHTML={{ __html: WUENSCHE_HTML }} />;
});

export const MapHost = memo(function MapHost() {
  return <section className="view view-map" id="view-map" aria-labelledby="map-title" dangerouslySetInnerHTML={{ __html: MAP_HTML }} />;
});

export const AdminHost = memo(function AdminHost() {
  return <section className="view wrap view-page" id="view-admin" aria-labelledby="admin-title" dangerouslySetInnerHTML={{ __html: ADMIN_HTML }} />;
});

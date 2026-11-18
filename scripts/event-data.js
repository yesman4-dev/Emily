/**
 * DTO principal del evento. Cambiar estos valores actualiza toda la invitación.
 */
class EventDTO {
  constructor({ name, displayName, dateTime, durationHours, venue, latitude, longitude, attendance, song, childhoodPhotos, portraitPhotos }) {
    this.name = name;
    this.displayName = displayName;
    this.dateTime = new Date(dateTime);
    this.durationHours = durationHours;
    this.venue = venue;
    this.latitude = latitude;
    this.longitude = longitude;
    this.attendance = Object.freeze({ ...attendance });
    this.song = Object.freeze({ ...song });
    this.childhoodPhotos = Object.freeze(childhoodPhotos.map((photo) => Object.freeze({ ...photo })));
    this.portraitPhotos = Object.freeze(portraitPhotos.map((photo) => Object.freeze({ ...photo })));
    Object.freeze(this);
  }
}

window.EVENT_DATA = new EventDTO({
  name: "Emily Sofía Sanches Molina",
  displayName: "Emily Sofía",
  // Zona horaria de Honduras (UTC-6). El 23 de noviembre de 2026 cae lunes.
  dateTime: "2026-11-23T17:00:00-06:00",
  durationHours: 5,
  venue: "Casa de habitación",
  latitude: 13.177734,
  longitude: -87.136597,
  attendance: {
    phone: "50489030844",
    message: "Hola, confirmo mi asistencia a los XV años de Emily Sofía Sanches Molina el lunes 23 de noviembre de 2026 a las 5:00 p. m. ¡Gracias por la invitación!",
  },
  song: {
    title: "The Climb",
    artist: "Miley Cyrus",
    source: "assets/audio/the-climb.mp3",
  },
  childhoodPhotos: [
    { src: "assets/images/lizzy-childhood-01.jpg", alt: "Emily Sofía de bebé sentada con un vestido de flores", caption: "Mis primeros pasos" },
    { src: "assets/images/lizzy-childhood-02.jpg", alt: "Primer plano de Emily Sofía cuando era bebé", caption: "Pequeños momentos, grandes recuerdos" },
    { src: "assets/images/lizzy-childhood-03.jpg", alt: "Emily Sofía de niña con vestido blanco y celeste", caption: "Una sonrisa que creció conmigo" },
    { src: "assets/images/lizzy-childhood-04.jpg", alt: "Emily Sofía de niña junto al árbol de Navidad", caption: "Sueños de infancia" },
  ],
  portraitPhotos: [
    { src: "assets/images/lizzy-hero.jpg", alt: "Emily Sofía con vestido rosa en una cabina floral", caption: "La magia de mis XV" },
    { src: "assets/images/lizzy-portrait-01.jpg", alt: "Emily Sofía sentada entre flores rosadas y lilas", caption: "Un sueño hecho realidad" },
    { src: "assets/images/lizzy-portrait-02.jpg", alt: "Retrato de Emily Sofía sonriendo con corona", caption: "Mi momento de brillar" },
  ],
});

(function () {
  "use strict";

  const EVENT = window.EVENT_DATA;
  const TIME_ZONE = "America/Tegucigalpa";

  class DateFormatter {
    static long(date) {
      return new Intl.DateTimeFormat("es-HN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: TIME_ZONE,
      }).format(date);
    }

    static time(date) {
      return new Intl.DateTimeFormat("es-HN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: TIME_ZONE,
      })
        .format(date)
        .replace(/a\.\s*m\./i, "a. m.")
        .replace(/p\.\s*m\./i, "p. m.");
    }

    static short(date) {
      const parts = new Intl.DateTimeFormat("es-HN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: TIME_ZONE,
      }).formatToParts(date);
      const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
      return `${values.day} · ${values.month} · ${values.year}`;
    }

    static audio(seconds) {
      if (!Number.isFinite(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    }
  }

  class AudioPlayer {
    constructor(audio, elements) {
      this.audio = audio;
      this.toggleButton = elements.toggleButton;
      this.navButton = elements.navButton;
      this.icon = elements.icon;
      this.record = elements.record;
      this.progress = elements.progress;
      this.currentTime = elements.currentTime;
      this.duration = elements.duration;
      this.bindEvents();
    }

    bindEvents() {
      this.toggleButton.addEventListener("click", () => this.toggle());
      this.navButton.addEventListener("click", () => this.toggle());
      this.audio.addEventListener("play", () => this.renderState(true));
      this.audio.addEventListener("pause", () => this.renderState(false));
      this.audio.addEventListener("loadedmetadata", () => {
        this.duration.textContent = DateFormatter.audio(this.audio.duration);
      });
      this.audio.addEventListener("timeupdate", () => this.renderProgress());
      this.progress.addEventListener("input", () => {
        if (!Number.isFinite(this.audio.duration)) return;
        this.audio.currentTime = (Number(this.progress.value) / 100) * this.audio.duration;
      });
    }

    async play() {
      try {
        await this.audio.play();
        return true;
      } catch (error) {
        this.renderState(false);
        return false;
      }
    }

    toggle() {
      if (this.audio.paused) this.play();
      else this.audio.pause();
    }

    renderState(isPlaying) {
      this.icon.textContent = isPlaying ? "Ⅱ" : "▶";
      this.toggleButton.setAttribute("aria-label", isPlaying ? "Pausar The Climb" : "Reproducir The Climb");
      this.navButton.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
      this.navButton.setAttribute("aria-pressed", String(isPlaying));
      this.navButton.classList.toggle("is-muted", !isPlaying);
      this.record.classList.toggle("is-spinning", isPlaying);
    }

    renderProgress() {
      const percent = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0;
      this.progress.value = String(percent);
      this.progress.style.setProperty("--progress", `${percent}%`);
      this.currentTime.textContent = DateFormatter.audio(this.audio.currentTime);
    }
  }

  class CountdownController {
    constructor(targetDate, elements) {
      this.targetDate = targetDate;
      this.elements = elements;
      this.timerId = null;
    }

    start() {
      this.update();
      this.timerId = window.setInterval(() => this.update(), 1000);
    }

    update() {
      const remaining = Math.max(0, this.targetDate.getTime() - Date.now());
      const values = {
        days: Math.floor(remaining / 86_400_000),
        hours: Math.floor((remaining % 86_400_000) / 3_600_000),
        minutes: Math.floor((remaining % 3_600_000) / 60_000),
        seconds: Math.floor((remaining % 60_000) / 1000),
      };

      Object.entries(values).forEach(([key, value]) => {
        this.elements[key].textContent = String(value).padStart(2, "0");
      });

      if (remaining === 0) {
        window.clearInterval(this.timerId);
        this.elements.finished.hidden = false;
      }
    }
  }

  class GalleryPaginator {
    constructor({ items, container, pagination, pageSize = 3, onPhotoClick }) {
      this.items = items;
      this.container = container;
      this.pagination = pagination;
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.onPhotoClick = onPhotoClick;
      this.totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      this.render();
    }

    setPage(page) {
      this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
      this.render();
      this.container.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    render() {
      const offset = (this.currentPage - 1) * this.pageSize;
      const currentItems = this.items.slice(offset, offset + this.pageSize);
      this.container.replaceChildren(
        ...currentItems.map((item, localIndex) => this.createCard(item, offset + localIndex)),
      );
      this.renderPagination();
    }

    createCard(item, index) {
      const button = document.createElement("button");
      button.className = "photo-card";
      button.type = "button";
      button.setAttribute("aria-label", `Ampliar fotografía: ${item.caption}`);

      const image = document.createElement("img");
      image.src = item.src;
      image.alt = item.alt;
      image.loading = "lazy";
      image.decoding = "async";

      const caption = document.createElement("span");
      caption.className = "photo-card-overlay";
      caption.textContent = item.caption;

      button.append(image, caption);
      button.addEventListener("click", () => this.onPhotoClick(index, this.items));
      return button;
    }

    renderPagination() {
      this.pagination.replaceChildren();
      if (this.totalPages <= 1) {
        this.pagination.hidden = true;
        return;
      }

      this.pagination.hidden = false;
      const previous = this.createPageButton("←", "Página anterior", this.currentPage === 1, () =>
        this.setPage(this.currentPage - 1),
      );
      const status = document.createElement("span");
      status.className = "page-status";
      status.textContent = `${this.currentPage} / ${this.totalPages}`;
      const next = this.createPageButton("→", "Página siguiente", this.currentPage === this.totalPages, () =>
        this.setPage(this.currentPage + 1),
      );
      this.pagination.append(previous, status, next);
    }

    createPageButton(label, ariaLabel, disabled, action) {
      const button = document.createElement("button");
      button.className = "page-button";
      button.type = "button";
      button.textContent = label;
      button.setAttribute("aria-label", ariaLabel);
      button.disabled = disabled;
      button.addEventListener("click", action);
      return button;
    }
  }

  class LightboxController {
    constructor(dialog) {
      this.dialog = dialog;
      this.image = document.querySelector("#lightbox-image");
      this.caption = document.querySelector("#lightbox-caption");
      this.items = [];
      this.index = 0;
      this.bindEvents();
    }

    bindEvents() {
      document.querySelector("#lightbox-close").addEventListener("click", () => this.dialog.close());
      document.querySelector("#lightbox-prev").addEventListener("click", () => this.move(-1));
      document.querySelector("#lightbox-next").addEventListener("click", () => this.move(1));
      this.dialog.addEventListener("click", (event) => {
        if (event.target === this.dialog) this.dialog.close();
      });
      this.dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") this.move(-1);
        if (event.key === "ArrowRight") this.move(1);
      });
    }

    open(index, items) {
      this.items = items;
      this.index = index;
      this.render();
      this.dialog.showModal();
    }

    move(direction) {
      this.index = (this.index + direction + this.items.length) % this.items.length;
      this.render();
    }

    render() {
      const item = this.items[this.index];
      this.image.src = item.src;
      this.image.alt = item.alt;
      this.caption.textContent = item.caption;
    }
  }

  class CalendarService {
    static download(eventData) {
      const start = CalendarService.toUtcStamp(eventData.dateTime);
      const endDate = new Date(eventData.dateTime.getTime() + eventData.durationHours * 3_600_000);
      const end = CalendarService.toUtcStamp(endDate);
      const now = CalendarService.toUtcStamp(new Date());
      const location = `${eventData.latitude}, ${eventData.longitude}`;
      const content = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:-//Mis XV ${eventData.name}//ES`,
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:mis-xv-${start}@invitacion`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:Mis XV años de ${eventData.name}`,
        `DESCRIPTION:Acompáñame a celebrar mis XV años.`,
        `LOCATION:${eventData.venue} (${location})`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `mis-xv-${CalendarService.slug(eventData.displayName)}.ics`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(anchor.href);
    }

    static toUtcStamp(date) {
      return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    }

    static slug(value) {
      return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
  }

  class EventPageController {
    constructor(eventData) {
      this.event = eventData;
      this.lightbox = new LightboxController(document.querySelector("#lightbox"));
      this.audioPlayer = new AudioPlayer(document.querySelector("#event-audio"), {
        toggleButton: document.querySelector("#music-toggle"),
        navButton: document.querySelector("#nav-sound"),
        icon: document.querySelector(".music-icon"),
        record: document.querySelector("#record"),
        progress: document.querySelector("#audio-progress"),
        currentTime: document.querySelector("#current-time"),
        duration: document.querySelector("#duration"),
      });
    }

    init() {
      this.bindEventData();
      this.configureLocation();
      this.configureAttendance();
      this.configureInvitationGate();
      this.configureGalleries();
      this.configureCountdown();
      this.configureCalendar();
      this.configureRevealMotion();
      this.configureNavigation();
    }

    bindEventData() {
      document.querySelectorAll("[data-event-name]").forEach((element) => {
        element.textContent = this.event.name;
      });
      document.querySelectorAll("[data-event-display-name]").forEach((element) => {
        element.textContent = this.event.displayName;
      });
      document.querySelectorAll("[data-event-short-date]").forEach((element) => {
        element.textContent = DateFormatter.short(this.event.dateTime);
      });
      document.querySelectorAll("[data-event-long-date]").forEach((element) => {
        element.textContent = `${DateFormatter.long(this.event.dateTime)} · ${DateFormatter.time(this.event.dateTime)}`;
      });
      document.querySelectorAll("[data-event-date]").forEach((element) => {
        element.textContent = DateFormatter.long(this.event.dateTime);
      });
      document.querySelectorAll("[data-event-time]").forEach((element) => {
        element.textContent = DateFormatter.time(this.event.dateTime);
      });
      document.querySelectorAll("[data-event-venue]").forEach((element) => {
        element.textContent = this.event.venue;
      });
      document.querySelectorAll("[data-event-coordinates]").forEach((element) => {
        element.textContent = `${this.event.latitude}, ${this.event.longitude}`;
      });
    }

    configureInvitationGate() {
      const gate = document.querySelector("#invitation-gate");
      const openButton = document.querySelector("#open-invitation");
      openButton.focus();
      openButton.addEventListener("click", async () => {
        await this.audioPlayer.play();
        gate.classList.add("is-open");
        document.body.classList.remove("is-locked");
        window.setTimeout(() => {
          gate.setAttribute("aria-hidden", "true");
          document.querySelector(".brand").focus({ preventScroll: true });
        }, 850);
      });
    }

    configureGalleries() {
      const openPhoto = (index, items) => this.lightbox.open(index, items);
      new GalleryPaginator({
        items: this.event.childhoodPhotos,
        container: document.querySelector("#story-gallery"),
        pagination: document.querySelector("#story-pagination"),
        pageSize: 3,
        onPhotoClick: openPhoto,
      });
      new GalleryPaginator({
        items: this.event.portraitPhotos,
        container: document.querySelector("#portrait-gallery"),
        pagination: document.querySelector("#portrait-pagination"),
        pageSize: 3,
        onPhotoClick: openPhoto,
      });
    }

    configureCountdown() {
      new CountdownController(this.event.dateTime, {
        days: document.querySelector("#days"),
        hours: document.querySelector("#hours"),
        minutes: document.querySelector("#minutes"),
        seconds: document.querySelector("#seconds"),
        finished: document.querySelector("#countdown-finished"),
      }).start();
    }

    configureLocation() {
      const { latitude, longitude } = this.event;
      const delta = 0.008;
      const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
      document.querySelector("#maps-link").href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      document.querySelector("#waze-link").href = `https://www.waze.com/ul?ll=${latitude}%2C${longitude}&navigate=yes`;
      document.querySelector("#map-embed").src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
    }

    configureAttendance() {
      const { phone, message } = this.event.attendance;
      document.querySelector("#attendance-link").href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }

    configureCalendar() {
      document.querySelector("#add-calendar").addEventListener("click", () => CalendarService.download(this.event));
    }

    configureRevealMotion() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealItems = document.querySelectorAll(".reveal");
      if (reducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px" },
      );
      revealItems.forEach((item) => observer.observe(item));
    }

    configureNavigation() {
      const header = document.querySelector(".site-header");
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 36);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    new EventPageController(EVENT).init();
  });
})();

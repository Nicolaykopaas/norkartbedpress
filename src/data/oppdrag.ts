export type Oppdrag = {
  id: string;
  tittel: string;
  tekst: string;
  /** Id til stedet oppdraget hører til (se aktiviteter.json) */
  stedId: string;
};

/** Små oppdrag for hele familien, knyttet til kjente steder. */
export const OPPDRAG: Oppdrag[] = [
  {
    id: 'olav',
    tittel: 'Stå som Olav',
    tekst:
      'Finn statuen av Olav Tryggvason øverst på søylen, og stå i samme positur i fem sekunder.',
    stedId: 'torvet',
  },
  {
    id: 'bybro',
    tittel: 'Lykkens portal',
    tekst: 'Gå gjennom portalen på Gamle Bybro og si et ønske høyt.',
    stedId: 'gamle-bybro',
  },
  {
    id: 'domen',
    tittel: 'Tårn-detektiven',
    tekst:
      'Tell hvor mange tårn du ser på Nidarosdomen, og rop svaret til resten av gruppen.',
    stedId: 'nidarosdomen',
  },
  {
    id: 'festning',
    tittel: 'Utsiktsjakt',
    tekst: 'Fra festningen: finn Nidarosdomen og pek på den uten å bruke kart.',
    stedId: 'kristiansten',
  },
  {
    id: 'ravnkloa',
    tittel: 'Fiskejakt',
    tekst: 'Finn ut hvor mange ulike fiskeprodukter du kan se ved Ravnkloa.',
    stedId: 'ravnkloa',
  },
  {
    id: 'stiftsgarden',
    tittel: 'Slottsvakt',
    tekst: 'Tell vinduene langs framsiden av Stiftsgården. Hvem teller riktig?',
    stedId: 'stiftsgarden',
  },
  {
    id: 'rockheim',
    tittel: 'Rockestjerne',
    tekst: 'Ta et bilde i rockepositur foran Rockheim.',
    stedId: 'rockheim',
  },
  {
    id: 'samfundet',
    tittel: 'Det runde huset',
    tekst: 'Ta et bilde av den runde fasaden på Studentersamfundet.',
    stedId: 'samfundet',
  },
  {
    id: 'stasjon',
    tittel: 'Neste avgang',
    tekst: 'Finn avgangstavlen og se hvilket tog som går til Bodø.',
    stedId: 'sentralstasjon',
  },
  {
    id: 'bakklandet',
    tittel: 'Fargejakt',
    tekst: 'Finn det mest fargerike huset på Bakklandet og ta et bilde av det.',
    stedId: 'bakklandet',
  },
];

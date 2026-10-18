export type PageFormatType = 'notebook' | 'dual_notebook' | 'hardcover' | 'paperback' | 'massmarket' | 'pocket';

export interface PageFormat {
  id: PageFormatType;
  name: string;
  width: string; // in pixels or relative for the container
  aspectRatio: string;
  isBook: boolean;
  fontSize: string;
  lineHeight: string;
  margins: {
    top: string;
    bottom: string;
    inner: string;
    outer: string;
  };
}

export const PAGE_FORMATS: PageFormat[] = [
  {
    id: 'notebook',
    name: 'Notebook (8.5" x 11")',
    width: '900px',
    aspectRatio: '1/1.4142',
    isBook: false,
    fontSize: '19px',
    lineHeight: '32px',
    margins: {
      top: '80px',
      bottom: '80px',
      inner: '60px',
      outer: '60px',
    }
  },
  {
    id: 'dual_notebook',
    name: 'Dual Notebook (8.5" x 11")',
    width: '900px',
    aspectRatio: '1/1.4142',
    isBook: false,
    fontSize: '19px',
    lineHeight: '32px',
    margins: {
      top: '80px',
      bottom: '80px',
      inner: '60px',
      outer: '60px',
    }
  },
  {
    id: 'hardcover',
    name: 'Hardcover (6" x 9")',
    width: '450px', // per page
    aspectRatio: '2/3',
    isBook: true,
    fontSize: '16px',
    lineHeight: '26px',
    margins: {
      top: '60px',
      bottom: '60px',
      inner: '40px',
      outer: '30px',
    }
  },
  {
    id: 'paperback',
    name: 'Paperback (5.5" x 8.5")',
    width: '412px',
    aspectRatio: '0.647',
    isBook: true,
    fontSize: '15px',
    lineHeight: '24px',
    margins: {
      top: '50px',
      bottom: '50px',
      inner: '35px',
      outer: '25px',
    }
  },
  {
    id: 'massmarket',
    name: 'Mass Market (4.25" x 6.87")',
    width: '320px',
    aspectRatio: '0.618',
    isBook: true,
    fontSize: '14px',
    lineHeight: '22px',
    margins: {
      top: '40px',
      bottom: '40px',
      inner: '30px',
      outer: '20px',
    }
  },
  {
    id: 'pocket',
    name: 'Pocket (4" x 6")',
    width: '300px',
    aspectRatio: '2/3',
    isBook: true,
    fontSize: '13px',
    lineHeight: '20px',
    margins: {
      top: '35px',
      bottom: '35px',
      inner: '25px',
      outer: '18px',
    }
  }
];

import { ReactiveBlgPage } from './app.po';

describe('reactive-blg App', function() {
  let page: ReactiveBlgPage;

  beforeEach(() => {
    page = new ReactiveBlgPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

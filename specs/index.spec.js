const { expect } = require('chai');
const fetch = require("node-fetch");
const FakeServer = require('../lib');


describe('FakeServer', () => {
  let server = null;
  beforeEach(() => {
    server = new FakeServer(3535)
    server.get({ path: '/lol', response: { LOL: 'LOL' } });
    server.put({ path: '/lol', response: { lol1: 'lol1' } });
    server.get({ path: 'https://lol.com', response: { LOL_COM: 'LOL_COM' } });
    server.get({ path: '/html', response: '<div></div>' });
    server.post({ path: '/xxx', response: { LOLXXX: 'LOLXX' }, errorResponse: { error: 'SUPER CUSTOM ERROR' }, assertRequestBody: true, requestBody: { a: 'a' } });
    server.post({ path: '/ggg', response: { LOLGGG: 'LOLGGG' } });
    server.post({ path: '/new', response: { LOLNEW: 'LOLNEW' } });
    server.del({ path: '/nnn', response: { NNN: 'NNN' } });
    server.start();
    expect(server.runned).to.eql(true);
  });
  afterEach(() => {
    server.restore();
    expect(server.runned).to.eql(false);
  });
  it('github', async () => {
    const resp_http = await fetch('https://lol.com');
    const resp1 = await fetch('https://github.com');
    expect(resp_http.status).to.eql(200);
    expect(await resp_http.json()).to.eql({ LOL_COM: 'LOL_COM' });
    expect(resp1.status).to.eql(200)
  });
  it('get', async () => {
    const result = await fetch('http://localhost:3535/lol');
    expect(result.status).to.eql(200);
    expect(await result.json()).to.eql({ LOL: 'LOL' });
    const callResult = server.getGetResult('/lol');
    expect(callResult.called).to.eql(true)
    expect(callResult.callCount).to.eql(1)
    expect(callResult.calledArgs).to.eql([])
    expect(callResult.method).to.eql('GET')
  });
  it('get negative', async () => {
    {
      const result = await fetch('http://localhost:3535/aaaaa');
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'api.notfound' });
    }
    {
      const result = await fetch('http://localhost:3535');
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'api.notfound' });
    }
  });
  it('put ', async () => {
    {
      const result = await fetch('http://localhost:3535/lol?dsadas=dsadas', { method: 'PUT', body: JSON.stringify({ a: 'a' }) });
      expect(result.status).to.eql(200);
      expect(await result.json()).to.eql({ lol1: 'lol1' });
      const callResult = server.getPutResult('/lol');
      expect(callResult.called).to.eql(true)
      expect(callResult.callCount).to.eql(1)
      expect(callResult.calledArgs).to.eql([{ a: 'a' }])
      expect(callResult.method).to.eql('PUT')
      expect(callResult.calledWithArgs({ a: 'a' })).to.eql(true)
    }
  });
  it('put negative', async () => {
    {
      const result = await fetch('http://localhost:3535/aaaaa', { method: 'PUT' });
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'api.notfound' });
    }
    {
      const result = await fetch('http://localhost:3535', { method: 'PUT' });
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'api.notfound' });
    }
  });
  it('post ', async () => {
    {
      const result = await fetch('http://localhost:3535/ggg', { method: 'POST' });
      expect(result.status).to.eql(200);
      expect(await result.json()).to.eql({ LOLGGG: 'LOLGGG' });
    }
    {
      const result = await fetch('http://localhost:3535/xxx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: 'a' })
      }); //headers["Content-Type"] = "application/json";
      expect(result.status).to.eql(200);
      expect(await result.json()).to.eql({ LOLXXX: 'LOLXX' });
    }
  });
  it('post negative', async () => {
    {
      const result = await fetch('http://localhost:3535/xxx', { method: 'POST' });
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'SUPER CUSTOM ERROR' });
    }
    {
      const result = await fetch('http://localhost:3535', { method: 'POST' });
      expect(result.status).to.eql(400);
      expect(await result.json()).to.eql({ error: 'api.notfound' });
    }
  });
  it('del', async () => {
    {
      const result = await fetch('http://localhost:3535/nnn', { method: 'DELETE' });
      expect(result.status).to.eql(200);
      expect(await result.json()).to.eql({ NNN: 'NNN' });
    }
    {
      const result = await fetch('http://localhost:3535/nnn', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'test' })
      });
      expect(result.status).to.eql(200);
      expect(await result.json()).to.eql({ NNN: 'NNN' });
    }
  });
  it('del negative', async () => {
    const result = await fetch('http://localhost:3535', { method: 'DELETE' });
    expect(result.status).to.eql(400);
    expect(await result.json()).to.eql({ error: 'api.notfound' });
  });
});

#!/usr/bin/env python
from evesrp import create_app
from evesrp.killmail import CRESTMail, ZKillmail, SQLShipMixin

import config

class SQLZKillmail(ZKillmail, SQLShipMixin('sqlite:///rubicon.sqlite')): pass

app = create_app()
app.config.from_object(config.Development)
app.config['USER_AGENT_EMAIL'] = 'paxswill@paxswill.com'
app.config['KILLMAIL_SOURCES'] = [CRESTMail, SQLZKillmail]

if __name__ == '__main__':
    app.extensions['sqlalchemy'].db.create_all(app=app)
    app.run()

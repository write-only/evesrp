#!/usr/bin/env python
from setuptools import setup

setup(
    name='EVE-SRP',
    version='0.2dev',
    description='EVE Ship Replacement Program Helper',
    author='Will Ross',
    author_email='paxswill@paxswill.com',
    url='https://github.com/evesrp',
    packages=['evesrp', 'evesrp.auth'],
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Framework :: Flask',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python :: 3',
        'Topic :: Games/Entertainment'
    ],
    install_requires=[
        'Flask==0.10.1',
        'Flask-Login==0.2.10',
        'Flask-Principal==0.4.0',
        'Flask-SQLAlchemy==1.0',
        'Flask-WTF==0.9.4',
        'SQLAlchemy==0.9.3',
        'WTForms==1.0.5',
        'requests==2.2.1',
    ],
)
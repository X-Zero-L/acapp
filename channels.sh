#! /bin/bash

daphne -b 0.0.0.0 -p 5015 acapp.asgi:application

#!/bin/bash

# Create the session to be used
tmux new-session -d -s orio

# Split the window
tmux split-window -v
tmux split-window -h
tmux select-pane -t 0
tmux split-window -h

# Run commands
tmux send-keys -t 0 "workon orio-web && cd project" enter
tmux send-keys -t 1 "workon orio-web && cd project && python manage.py shell_plus" enter
tmux send-keys -t 2 "workon orio-web && cd project && python manage.py runserver 9000" enter
tmux send-keys -t 3 "workon orio-web && cd project && node webpack.devserver.js" enter

# attach to shell
tmux select-pane -t 0
tmux attach-session

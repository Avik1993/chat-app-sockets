# Chat Application using socket.io

```
Ways to send event from Server -> Client OR Client => Server
1. socket.emit                      - Used to transmit to all in current connection, specific client
2. io.emit                          - Used to transmit to all clients
3. socket.broadcast.emit            - Used to transmit to all except current client

VARIATIONS
1. io.to.emit                        - Send to all in current room
2. socket.broadcast.to.emit          - Send to all in current room except current client
```


```
Every Socket Connection has a different ID
that could be utilized to fetch particular 
connection.
```
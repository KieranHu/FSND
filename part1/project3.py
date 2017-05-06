from twilio.rest import Client

account_sid = "AC0ff6c648613822004981318a6f495100"
auth_token = "db0d3002c6a811aa174255688593075e"
client = Client(account_sid, auth_token)

message = client.messages.create(to ="+15857195681",from_="+15855632937", body ="Test message send to my dear cindy, hahahha")
print message.sid
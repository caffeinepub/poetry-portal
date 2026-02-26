import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

import VarArray "mo:core/VarArray";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Versioning
  let versionMajor = 9;
  let versionMinor = 0;
  let versionPatch = 0;

  // Types
  public type UserProfile = { name : Text };

  public type CollectionView = {
    id : Nat;
    name : Text;
    description : Text;
    dateCreated : Time.Time;
    poemIds : [Nat];
  };

  public type Poem = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    dateCreated : Time.Time;
    poemType : PoemType;
    imageUrl : ?Storage.ExternalBlob;
  };

  public type PoemType = { #text; #image };

  public type Collection = {
    id : Nat;
    name : Text;
    description : Text;
    dateCreated : Time.Time;
    poemIds : Map.Map<Nat, {}>;
  };

  public type PoemSearchResult = { poem : Poem; collectionNames : [Text] };

  public type Notification = {
    message : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  public type PoemSubmission = {
    title : Text;
    content : Text;
    author : Text;
    poemType : PoemType;
    imageUrl : ?Storage.ExternalBlob;
    collectionIds : [Nat];
  };

  // State
  let poems = Map.empty<Nat, Poem>();
  let collections = Map.empty<Nat, Collection>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var poemIdCounter = 0;
  var collectionIdCounter = 0;
  var draftModeEnabled = true;

  // Draft mode - accessible to everyone (no auth required)
  public query ({ caller }) func getIsDraftModeEnabled() : async Bool {
    draftModeEnabled;
  };

  // Fetch version - accessible to everyone
  public query ({ caller }) func getVersion() : async (Nat, Nat, Nat) {
    (versionMajor, versionMinor, versionPatch);
  };

  // Admin-only function to enable/disable draft mode
  public shared ({ caller }) func setDraftMode(enabled : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can change draft mode");
    };
    draftModeEnabled := enabled;
  };

  // Admin-only function to publish current version (switch off draft mode)
  public shared ({ caller }) func publishToProduction() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can publish to production");
    };
    draftModeEnabled := false;
  };

  // User-only: view own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // User can view own profile, admin can view any profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // User-only: save own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: create poems
  public shared ({ caller }) func submitPoem(
    title : Text,
    content : Text,
    author : Text,
    poemType : PoemType,
    imageUrl : ?Storage.ExternalBlob,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create poems");
    };

    let newPoem : Poem = {
      id = poemIdCounter;
      title;
      content;
      author;
      dateCreated = Time.now();
      poemType;
      imageUrl;
    };
    poems.add(poemIdCounter, newPoem);

    let notification : Notification = {
      message = "New poem added: " # title;
      timestamp = Time.now();
      read = false;
    };

    for ((user, _) in userProfiles.entries()) {
      let userNotifications = switch (notifications.get(user)) {
        case (null) { List.empty<Notification>() };
        case (?existing) { existing };
      };
      userNotifications.add(notification);
      notifications.add(user, userNotifications);
    };

    poemIdCounter += 1;
    poemIdCounter - 1;
  };

  // User-only: mark own notifications as read
  public shared ({ caller }) func markNotificationAsRead(index : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can mark notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { Runtime.trap("No notifications found") };
      case (?userNotifications) {
        if (index >= userNotifications.size()) {
          Runtime.trap("Notification index out of bounds");
        };

        let notificationsArray = userNotifications.toArray();
        let updatedArray = Array.tabulate(
          notificationsArray.size(),
          func(i) {
            if (i == index) {
              {
                notificationsArray[i] with
                read = true;
              };
            } else {
              notificationsArray[i];
            };
          },
        );
        notifications.add(caller, List.fromArray<Notification>(updatedArray));
      };
    };
  };

  // Public query - accessible to all users
  public query ({ caller }) func getAllPoems() : async [Poem] {
    poems.values().toArray();
  };

  // Public query - accessible to all users
  public query ({ caller }) func getPoemById(id : Nat) : async Poem {
    switch (poems.get(id)) {
      case (null) { Runtime.trap("Poem not found") };
      case (?poem) { poem };
    };
  };

  // User-only: view own notifications
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) { userNotifications.toArray() };
    };
  };

  // User-only: view own unread notification count
  public query ({ caller }) func getUnreadNotificationsCount() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { 0 };
      case (?userNotifications) {
        var count = 0;
        for (notification in userNotifications.values()) {
          if (not notification.read) { count += 1 };
        };
        count;
      };
    };
  };

  // Public query - accessible to all users
  public query ({ caller }) func getAllCollections() : async [CollectionView] {
    collections.values().toArray().map<Collection, CollectionView>(
      func(collection) {
        {
          collection with
          poemIds = collection.poemIds.keys().toArray();
        };
      }
    );
  };

  // Public query - accessible to all users
  public query ({ caller }) func getPoemsByCollectionId(collectionId : Nat) : async [Poem] {
    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        let poemList = List.empty<Poem>();
        for (poemId in collection.poemIds.keys()) {
          switch (poems.get(poemId)) {
            case (null) {};
            case (?poem) { poemList.add(poem) };
          };
        };
        poemList.toArray();
      };
    };
  };

  // Admin-only: remove poems from collections
  public shared ({ caller }) func removePoemFromCollection(
    collectionId : Nat,
    poemId : Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can remove poems from collections");
    };

    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        if (not collection.poemIds.containsKey(poemId)) {
          Runtime.trap("Poem not in collection");
        };
        let updatedPoemIds = collection.poemIds.clone();
        updatedPoemIds.remove(poemId);
        collections.add(
          collectionId,
          {
            collection with
            poemIds = updatedPoemIds
          },
        );
      };
    };
  };

  // Admin-only: delete collections
  public shared ({ caller }) func deleteCollection(collectionId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete collections");
    };

    switch (collections.containsKey(collectionId)) {
      case (true) {
        collections.remove(collectionId);
      };
      case (false) {
        Runtime.trap("Collection does not exist");
      };
    };
  };

  // Public query - accessible to all users
  public query ({ caller }) func searchPoems(searchTerm : Text) : async [PoemSearchResult] {
    let lowerSearchTerm = searchTerm.toLower();
    let results = List.empty<PoemSearchResult>();

    for (poem in poems.values()) {
      let matchesTitle = poem.title.toLower().contains(#text lowerSearchTerm);
      let matchesContent = poem.content.toLower().contains(#text lowerSearchTerm);
      let matchesAuthor = poem.author.toLower().contains(#text lowerSearchTerm);

      var matchesCollection = false;
      let collectionNames = List.empty<Text>();
      for (collection in collections.values()) {
        if (collection.poemIds.containsKey(poem.id)) {
          collectionNames.add(collection.name);
          if (collection.name.toLower().contains(#text lowerSearchTerm)) {
            matchesCollection := true;
          };
        };
      };

      if (matchesTitle or matchesContent or matchesAuthor or matchesCollection) {
        results.add({
          poem;
          collectionNames = collectionNames.toArray();
        });
      };
    };
    results.toArray();
  };

  // Admin-only: create collections
  public shared ({ caller }) func createCollection(name : Text, description : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create collections");
    };

    let newCollection : Collection = {
      id = collectionIdCounter;
      name;
      description;
      dateCreated = Time.now();
      poemIds = Map.empty<Nat, {}>();
    };
    collections.add(collectionIdCounter, newCollection);
    collectionIdCounter += 1;
    collectionIdCounter - 1;
  };

  // Admin-only: add poems to collections
  public shared ({ caller }) func addPoemToCollection(collectionId : Nat, poemId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add poems to collections");
    };

    if (not poems.containsKey(poemId)) {
      Runtime.trap("Poem does not exist");
    };

    switch (collections.get(collectionId)) {
      case (null) { Runtime.trap("Collection not found") };
      case (?collection) {
        let updatedPoemIds = collection.poemIds.clone();
        updatedPoemIds.add(poemId, {});
        collections.add(
          collectionId,
          {
            collection with
            poemIds = updatedPoemIds
          },
        );
      };
    };
  };

  // Admin-only: submit poem with collections
  public shared ({ caller }) func submitPoemWithCollections(
    submission : PoemSubmission
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create poems");
    };

    let newPoem : Poem = {
      id = poemIdCounter;
      title = submission.title;
      content = submission.content;
      author = submission.author;
      dateCreated = Time.now();
      poemType = submission.poemType;
      imageUrl = submission.imageUrl;
    };
    poems.add(poemIdCounter, newPoem);

    let notification : Notification = {
      message = "New poem added: " # submission.title;
      timestamp = Time.now();
      read = false;
    };

    for ((user, _) in userProfiles.entries()) {
      let userNotifications = switch (notifications.get(user)) {
        case (null) { List.empty<Notification>() };
        case (?existing) { existing };
      };
      userNotifications.add(notification);
      notifications.add(user, userNotifications);
    };

    for (collectionId in submission.collectionIds.values()) {
      switch (collections.get(collectionId)) {
        case (null) {};
        case (?collection) {
          let updatedPoemIds = collection.poemIds.clone();
          updatedPoemIds.add(poemIdCounter, {});
          collections.add(
            collectionId,
            {
              collection with
              poemIds = updatedPoemIds
            },
          );
        };
      };
    };

    poemIdCounter += 1;
    poemIdCounter - 1;
  };

  // Admin-only: update poems
  public shared ({ caller }) func updatePoem(poemId : Nat, newPoem : Poem) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update poems");
    };
    poems.add(poemId, newPoem);
  };

  // Admin-only: delete poem and its associated blob/image data
  public shared ({ caller }) func deletePoem(poemId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete poems");
    };

    // Fetch poem to access image data before removal
    let poem = switch (poems.get(poemId)) {
      case (null) { Runtime.trap("Poem not found") };
      case (?poem) { poem };
    };

    // Remove poem from all collections
    for (collection in collections.values()) {
      let keysArray = collection.poemIds.keys().toArray();
      for (poemKey in keysArray.values()) {
        if (poemKey == poemId) {
          let updatedPoemIds = collection.poemIds.clone();
          updatedPoemIds.remove(poemId);
          collections.add(
            collection.id,
            {
              collection with
              poemIds = updatedPoemIds
            },
          );
        };
      };
    };

    // Remove poem from state
    poems.remove(poemId);

    // Remove associated blob data if present
    switch (poem.imageUrl) {
      case (null) {};
      case (?blob) {
        ignore blob;
        // Blob deletion to be handled via blob storage API in future
      };
    };
  };
};


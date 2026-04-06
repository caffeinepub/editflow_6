import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type DocumentId = Nat;
  type FolderId = Nat;

  type Document = {
    id : DocumentId;
    owner : Principal;
    title : Text;
    content : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    folderId : ?FolderId;
  };

  type DocumentVersion = {
    versionId : Nat;
    documentId : DocumentId;
    content : Text;
    savedAt : Time.Time;
  };

  type Folder = {
    id : FolderId;
    owner : Principal;
    name : Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    hasSeenSampleData : Bool;
  };

  module Document {
    public func compare(doc1 : Document, doc2 : Document) : Order.Order {
      Nat.compare(doc1.id, doc2.id);
    };
  };

  var nextDocumentId = 1;
  var nextVersionId = 1;
  var nextFolderId = 1;

  let documents = Map.empty<DocumentId, Document>();
  let documentVersions = Map.empty<Nat, DocumentVersion>();
  let folders = Map.empty<FolderId, Folder>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func ensureDocumentOwner(doc : Document, caller : Principal) {
    if (doc.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Not the document owner");
    };
  };

  func ensureFolderOwner(folder : Folder, caller : Principal) {
    if (folder.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Not the folder owner");
    };
  };

  func seedSampleDocuments(caller : Principal) {
    // Create sample document 1
    let doc1Id = nextDocumentId;
    nextDocumentId += 1;
    let doc1 : Document = {
      id = doc1Id;
      owner = caller;
      title = "Welcome to EditFlow";
      content = "<h1>Welcome!</h1><p>This is your first document. Start editing to see the magic happen.</p>";
      createdAt = Time.now();
      updatedAt = Time.now();
      folderId = null;
    };
    documents.add(doc1Id, doc1);

    // Create sample document 2
    let doc2Id = nextDocumentId;
    nextDocumentId += 1;
    let doc2 : Document = {
      id = doc2Id;
      owner = caller;
      title = "Getting Started Guide";
      content = "<h2>Quick Start</h2><ul><li>Create new documents</li><li>Organize with folders</li><li>Track version history</li></ul>";
      createdAt = Time.now();
      updatedAt = Time.now();
      folderId = null;
    };
    documents.add(doc2Id, doc2);

    // Create sample document 3
    let doc3Id = nextDocumentId;
    nextDocumentId += 1;
    let doc3 : Document = {
      id = doc3Id;
      owner = caller;
      title = "Tips and Tricks";
      content = "<p>Use the search feature to quickly find your documents. Version history keeps track of all your changes.</p>";
      createdAt = Time.now();
      updatedAt = Time.now();
      folderId = null;
    };
    documents.add(doc3Id, doc3);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Check if this is first login and seed sample data if needed
    let shouldSeed = switch (userProfiles.get(caller)) {
      case (null) { true };
      case (?existingProfile) { not existingProfile.hasSeenSampleData };
    };

    if (shouldSeed and not profile.hasSeenSampleData) {
      seedSampleDocuments(caller);
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createDocument(title : Text, content : Text) : async DocumentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create documents");
    };
    let id = nextDocumentId;
    nextDocumentId += 1;

    let document : Document = {
      id;
      owner = caller;
      title;
      content;
      createdAt = Time.now();
      updatedAt = Time.now();
      folderId = null;
    };

    documents.add(id, document);
    id;
  };

  public query ({ caller }) func getDocument(documentId : DocumentId) : async Document {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        ensureDocumentOwner(doc, caller);
        doc;
      };
    };
  };

  public shared ({ caller }) func updateDocument(documentId : DocumentId, title : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        ensureDocumentOwner(doc, caller);

        let versionId = nextVersionId;
        nextVersionId += 1;

        let version : DocumentVersion = {
          versionId;
          documentId;
          content = doc.content;
          savedAt = Time.now();
        };

        documentVersions.add(versionId, version);

        let updatedDoc : Document = {
          doc with
          title;
          content;
          updatedAt = Time.now();
        };

        documents.add(documentId, updatedDoc);
      };
    };
  };

  public shared ({ caller }) func deleteDocument(documentId : DocumentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        ensureDocumentOwner(doc, caller);
        documents.remove(documentId);
      };
    };
  };

  public query ({ caller }) func getUserDocuments() : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access documents");
    };
    documents.values().toArray().filter(func(doc) { doc.owner == caller }).sort();
  };

  public query ({ caller }) func getDocumentHistory(documentId : DocumentId) : async [DocumentVersion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access document history");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        ensureDocumentOwner(doc, caller);
        documentVersions.values().toArray().filter(func(version) { version.documentId == documentId });
      };
    };
  };

  public shared ({ caller }) func createFolder(name : Text) : async FolderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create folders");
    };
    let id = nextFolderId;
    nextFolderId += 1;

    let folder : Folder = {
      id;
      owner = caller;
      name;
      createdAt = Time.now();
    };

    folders.add(id, folder);
    id;
  };

  public shared ({ caller }) func moveDocumentToFolder(documentId : DocumentId, folderId : FolderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move documents");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        ensureDocumentOwner(doc, caller);
        switch (folders.get(folderId)) {
          case (null) { Runtime.trap("Folder not found") };
          case (?folder) {
            ensureFolderOwner(folder, caller);
            let updatedDoc : Document = {
              doc with
              folderId = ?folderId;
              updatedAt = Time.now();
            };
            documents.add(documentId, updatedDoc);
          };
        };
      };
    };
  };

  public query ({ caller }) func searchDocumentsByTitle(searchTerm : Text) : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search documents");
    };
    documents.values().toArray().filter(
      func(doc) {
        doc.owner == caller and doc.title.toLower().contains(#text(searchTerm.toLower()));
      }
    ).sort();
  };

  public query ({ caller }) func getUserFolders() : async [Folder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access folders");
    };
    folders.values().toArray().filter(func(f) { f.owner == caller });
  };
};
